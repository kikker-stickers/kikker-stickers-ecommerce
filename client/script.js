let allPrices = [];

document.addEventListener("DOMContentLoaded", function () {
  setupFormValidation();
  extractPriceDataFromTable();
  updateForm();
  document.getElementById("orderForm").addEventListener("submit", handleSubmit);
  document.getElementById("shape").addEventListener("change", updateForm);
  document.getElementById("size").addEventListener("change", updateForm);
  document
    .getElementById("quantity")
    .addEventListener("change", updatePriceDisplay);
  document.getElementById("image").addEventListener("change", validateInput);
  document.getElementById("shape").addEventListener("change", validateInput);
  document.getElementById("size").addEventListener("change", validateInput);
  document.getElementById("quantity").addEventListener("change", validateInput);

  const checkoutButton = document.querySelector('button[type="submit"]');
  checkoutButton.id = "addToCart";

  window.showSpinner = function () {
    const spinner = document.getElementById("processing-spinner");
    if (spinner) {
      spinner.style.display = "flex";
    }
  };

  window.hideSpinner = function () {
    const spinner = document.getElementById("processing-spinner");
    if (spinner) {
      spinner.style.display = "none";
    }
  };
});

document.addEventListener("snipcart.ready", function () {
  Snipcart.api.session.setLanguage("en");
  Snipcart.api.theme.customization.registerPaymentFormCustomization({
    shipping: {
      enabled: true,
    },
  });
  updateCartSummary();
});

function formatSize(width, height) {
  return `${width}" x ${height}"`;
}

function updateForm() {
  if (allPrices.length === 0) {
    return;
  }
  updateSizeOptions();
  updateQuantityOptions();
  updatePriceDisplay();
}

function updateSizeOptions() {
  const shape = document.getElementById("shape").value;
  const sizeSelect = document.getElementById("size");
  const sizeHelpText = document.getElementById("sizeHelpText");
  const currentSize = sizeSelect.value;

  const defaultOption = '<option value="">Select a size</option>';
  sizeSelect.innerHTML = defaultOption;
  document.getElementById("priceDisplay").textContent = "";

  let sizes = [];

  if (shape) {
    sizeSelect.disabled = false;
    sizeHelpText.classList.add("hidden");
    sizes = [
      ...new Set(
        allPrices
          .filter((item) => item.shape === shape)
          .map((item) => formatSize(item.width, item.height))
      ),
    ];
    sizes.forEach((size) => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      sizeSelect.appendChild(option);
    });

    if (sizes.includes(currentSize)) {
      sizeSelect.value = currentSize;
    }
  } else {
    sizeSelect.disabled = true;
    sizeHelpText.classList.remove("hidden");
  }

  updateQuantityOptions();
}

function updateQuantityOptions() {
  const shape = document.getElementById("shape").value;
  const size = document.getElementById("size").value;
  const quantityHelpText = document.getElementById("quantityHelpText");
  const quantitySelect = document.getElementById("quantity");
  const currentQuantity = quantitySelect.value;

  // Clear current options
  quantitySelect.innerHTML = '<option value="">Select a quantity</option>';

  let uniqueQuantities = [];

  if (shape && size) {
    quantityHelpText.classList.add("hidden");
    quantitySelect.disabled = false;
    // Get all unique quantities from allPrices for the selected shape and size
    uniqueQuantities = [
      ...new Set(
        allPrices
          .filter(
            (item) =>
              item.shape === shape &&
              formatSize(item.width, item.height) === size
          )
          .map((item) => item.quantity)
      ),
    ];

    // Sort quantities in ascending order
    uniqueQuantities.sort((a, b) => a - b);

    // Add quantity options
    uniqueQuantities.forEach((quantity) => {
      const option = document.createElement("option");
      option.value = quantity;
      option.textContent = quantity;
      quantitySelect.appendChild(option);
    });

    // Restore previously selected quantity if it exists in the new options
    if (uniqueQuantities.includes(parseInt(currentQuantity))) {
      quantitySelect.value = currentQuantity;
    }
  } else {
    quantityHelpText.classList.remove("hidden");
    quantitySelect.disabled = true;
  }
}

function updatePriceDisplay() {
  const shape = document.getElementById("shape").value;
  const size = document.getElementById("size").value;
  const quantity = parseInt(document.getElementById("quantity").value);

  let priceData = null;

  if (shape && size && quantity) {
    priceData = allPrices.find(
      (item) =>
        item.shape === shape &&
        formatSize(item.width, item.height) === size &&
        item.quantity === quantity
    );

    if (priceData) {
      document.getElementById(
        "priceDisplay"
      ).innerHTML = `Price: $${priceData.price.toFixed(
        2
      )} <span class="float-right text-green-600">($${(
        priceData.price / priceData.quantity
      ).toFixed(2)} each)</span>`;
    } else {
      document.getElementById("priceDisplay").textContent =
        "Price not available";
    }
  } else {
    document.getElementById("priceDisplay").textContent = "";
  }
}

function showSpinner() {
  const spinner = document.getElementById("processing-spinner");
  if (spinner) {
    spinner.style.display = "flex";
  }
}

function hideSpinner() {
  const spinner = document.getElementById("processing-spinner");
  if (spinner) {
    spinner.style.display = "none";
  }
}

function md5(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function addUnsigned(lX, lY) {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) {
      return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      } else {
        return lResult ^ 0x40000000 ^ lX8 ^ lY8;
      }
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }

  function F(x, y, z) {
    return (x & y) | (~x & z);
  }
  function G(x, y, z) {
    return (x & z) | (y & ~z);
  }
  function H(x, y, z) {
    return x ^ y ^ z;
  }
  function I(x, y, z) {
    return y ^ (x | ~z);
  }

  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWordsTempOne = lMessageLength + 8;
    const lNumberOfWordsTempTwo =
      (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
    const lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] =
        lWordArray[lWordCount] |
        (string.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function wordToHex(lValue) {
    let wordToHexValue = "",
      wordToHexValueTemp = "",
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValueTemp = "0" + lByte.toString(16);
      wordToHexValue =
        wordToHexValue +
        wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
    }
    return wordToHexValue;
  }

  function utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    let utfText = "";

    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);

      if (c < 128) {
        utfText += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utfText += String.fromCharCode((c >> 6) | 192);
        utfText += String.fromCharCode((c & 63) | 128);
      } else {
        utfText += String.fromCharCode((c >> 12) | 224);
        utfText += String.fromCharCode(((c >> 6) & 63) | 128);
        utfText += String.fromCharCode((c & 63) | 128);
      }
    }

    return utfText;
  }

  let x = [];
  let k, AA, BB, CC, DD, a, b, c, d;
  const S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  const S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  const S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  const S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;

  string = utf8Encode(string);

  x = convertToWordArray(string);

  a = 0x67452301;
  b = 0xefcdab89;
  c = 0x98badcfe;
  d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = II(a, b, c, d, x[k + 9], S41, 0xd9d4d039);
    d = II(d, a, b, c, x[k + 12], S42, 0xe6db99e5);
    c = II(c, d, a, b, x[k + 15], S43, 0x1fa27cf8);
    b = II(b, c, d, a, x[k + 2], S44, 0xc4ac5665);
    a = addUnsigned(a, AA);
    d = addUnsigned(d, DD);
    c = addUnsigned(c, CC);
    b = addUnsigned(b, BB);
  }

  const temp = wordToHex(a) + wordToHex(d) + wordToHex(c) + wordToHex(b);
  return temp.toLowerCase();
}

function handleSubmit(event) {
  event.preventDefault();

  document.querySelectorAll(".error-message").forEach((el) => el.remove());

  let isValid = true;

  const imageInput = document.getElementById("image");
  if (!imageInput.files || imageInput.files.length === 0) {
    displayError(imageInput, "Please upload an image");
    isValid = false;
  }

  const shapeSelect = document.getElementById("shape");
  if (!shapeSelect.value) {
    displayError(shapeSelect, "Please select a shape");
    isValid = false;
  }

  const sizeSelect = document.getElementById("size");
  if (!sizeSelect.value) {
    displayError(sizeSelect, "Please select a size");
    isValid = false;
  }

  const quantitySelect = document.getElementById("quantity");
  if (!quantitySelect.value) {
    displayError(quantitySelect, "Please select a quantity");
    isValid = false;
  }

  if (isValid) {
    const shape = shapeSelect.value;
    const size = sizeSelect.value;
    const quantity = parseInt(quantitySelect.value);
    const imageFile = imageInput.files[0];

    const priceData = allPrices.find(
      (item) =>
        item.shape === shape &&
        formatSize(item.width, item.height) === size &&
        item.quantity === quantity
    );

    if (priceData) {
      window.showSpinner();
      uploadSticker()
        .then((cloudinaryUrl) => {
          const itemToAdd = {
            id: priceData.id,
            name: `Custom ${shape} Sticker`,
            price: priceData.price,
            url: window.location.href,
            description: `${size} ${shape} sticker, quantity: ${quantity}`,
            image: cloudinaryUrl,
            quantity: 1,
            customFields: [
              {
                name: "Shape",
                value: shape,
              },
              {
                name: "Size",
                value: size,
              },
              {
                name: "Quantity",
                value: quantity.toString(),
              },
              {
                name: "ImageFileName",
                value: imageFile.name,
              },
            ],
            metadata: {
              stickerImageUrl: cloudinaryUrl,
            },
          };
          // console.log("Adding item to cart", itemToAdd);
          // console.log("Snipcart", Snipcart.store.getState().cart.items);
          return Snipcart.api.cart.items.add(itemToAdd);
        })
        .then(() => {
          updateCartSummary();
        })
        .catch((error) => {
          // Handle error
        })
        .finally(() => {
          window.hideSpinner();
        });
    }
  }
}

function displayError(element, message) {
  const container =
    element.closest('div[id$="Group"]') || element.parentElement;
  if (!container) {
    return;
  }
  const existingError = container.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message text-red-500 text-sm mt-1";
  errorDiv.textContent = message;

  // Insert the error message after the element
  container.appendChild(errorDiv);

  // Apply the shake animation
  errorDiv.classList.add("shake");

  // Remove the shake class after the animation completes
  setTimeout(() => {
    errorDiv.classList.remove("shake");
  }, 500);
}

function validateInput(event) {
  const input = event.target;
  const container = input.closest('div[id$="Group"]') || input.parentElement;
  if (!container) {
    return;
  }
  const errorMessage = container.querySelector(".error-message");

  if (errorMessage) {
    if (
      (input.type === "file" && input.files && input.files.length > 0) ||
      (input.type === "select-one" && input.value) ||
      (input.type !== "file" &&
        input.type !== "select-one" &&
        input.value.trim())
    ) {
      errorMessage.style.opacity = "0";
      errorMessage.style.transition = "opacity 0.3s ease-out";
      setTimeout(() => {
        errorMessage.remove();
      }, 300);
    }
  }
}

function setupFormValidation() {
  const formInputs = document.querySelectorAll(
    "#orderForm input, #orderForm select"
  );
  formInputs.forEach((input) => {
    input.addEventListener("change", validateInput, { passive: true });
    input.addEventListener("input", validateInput, { passive: true });
  });

  // Add specific handler for file input
  const fileInput = document.getElementById("image");
  fileInput.addEventListener(
    "change",
    function (event) {
      validateInput(event);
    },
    { passive: true }
  );
}

function updateCartSummary() {
  if (window.Snipcart) {
    Snipcart.store.subscribe(() => {
      const state = Snipcart.store.getState();
      const cartSummary = document.getElementById("cart-summary");
      const cartSummaryHeader = document.getElementById("cart-summary-header");
      if (cartSummary) {
        cartSummary.innerHTML = `
          <a href="#" class="snipcart-checkout">
            <i id="cart-icon" class="fas fa-shopping-cart"></i>
            <span id="cart-items" class="snipcart-items-count">${state.cart.items.count}</span> items -
            <span id="cart-total" class="snipcart-total-price">${state.cart.total}</span>
          </a>
        `;
      }

      if (cartSummaryHeader && state.cart.items.count > 0) {
        cartSummaryHeader.classList.remove("hidden");
        cartSummaryHeader.innerHTML = `
        <a href="#" class="snipcart-checkout">
          <div class="bg-white text-green-500 pb-0 px-4 rounded text-center flex items-center justify-center h-12 hover:bg-gray-100 transition duration-300 shadow-md">
            <i id="cart-icon-header" class="fas fa-shopping-cart"></i>
            <span id="cart-items-header" class="snipcart-items-count">${state.cart.items.count}</span>
          </div>
        </a>
        `;
      }
    });
  }
}

function extractPriceDataFromTable() {
  const tableRows = document.querySelectorAll("#priceTable tbody tr");
  allPrices = [];

  tableRows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 4) {
      const shape = cells[0].textContent.trim();
      const size = cells[1].textContent.trim();
      const quantity = parseInt(cells[2].textContent.trim());
      const price = parseFloat(cells[3].textContent.replace("$", "").trim());
      const [width, height] = size.split("x").map((s) => parseFloat(s));
      const id = row
        .querySelector("[data-item-id]")
        .getAttribute("data-item-id");

      allPrices.push({ shape, width, height, quantity, price, id });
    }
  });

  updateForm(); // Call updateForm after extracting price data
}
const uploadStickerCache = new Map();

function uploadSticker() {
  const fileInput = document.getElementById("image");

  if (!fileInput || !fileInput.files.length) {
    return Promise.reject("No file selected");
  }

  const file = fileInput.files[0];

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("image", file);

    // Convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      const md5Hash = md5(dataUrl);

      // Check if we have a cached result for this dataUrl
      if (uploadStickerCache.has(md5Hash)) {
        // console.log("Cache hit for", md5Hash);
        resolve(uploadStickerCache.get(md5Hash));
        return;
      }

      fetch("/upload-sticker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64: dataUrl }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // Cache the resolved imageUrl
          uploadStickerCache.set(md5Hash, data.imageUrl);
          // console.log("Cache set for", md5Hash);
          // console.log("Cache:", uploadStickerCache);
          resolve(data.imageUrl);
        })
        .catch((error) => {
          reject(error);
        });
    };
  });
}
