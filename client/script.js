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
          return Snipcart.api.cart.items.add({
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
            ],
            metadata: {
              stickerImageUrl: cloudinaryUrl,
            },
          });
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

function uploadSticker() {
  const fileInput = document.getElementById("image");

  if (!fileInput || !fileInput.files.length) {
    return Promise.reject("No file selected");
  }

  const file = fileInput.files[0];

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("image", file);

    //convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      const dataUrl = e.target.result;

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
          resolve(data.imageUrl);
        })
        .catch((error) => {
          reject(error);
        });
    };
  });
}
