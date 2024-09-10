let filerobotImageEditor;

function createEditorContainer() {
  const fileRobotSection = document.getElementById("fileRobot");
  if (fileRobotSection) {
    const container = document.createElement("div");
    container.id = "filerobot-editor-container";
    container.style.width = "100%";
    container.style.height = "600px";
    fileRobotSection.appendChild(container);
    return container;
  }
  return null;
}

function initializeFilerobotEditor(source) {
  console.log('Initializing Filerobot Editor');

  const config = {
    source: source,
    onSave: (editedImageObject, designState) => {
      console.log('Saved', editedImageObject, designState);
      document.getElementById('uploadedImage').src = editedImageObject.imageBase64;
    },
    annotationsCommon: {
      fill: '#ff0000',
    },
    Text: { text: 'Kikker Sticker' },
    Rotate: { angle: 90, componentType: 'slider' },
    translations: {
      profile: 'Profile',
      coverPhoto: 'Cover photo',
    },
  };

  const editorContainer = document.getElementById('filerobot-editor-container');
  
  console.log('editorContainer:', editorContainer);

  if (editorContainer) {
    console.log('Attempting to initialize FilerobotImageEditor');
    if (typeof FilerobotImageEditor === 'undefined') {
      console.error('FilerobotImageEditor is not defined. Make sure the script is loaded correctly.');
    } else {
      try {
        console.log('FilerobotImageEditor type:', typeof FilerobotImageEditor);
        console.log('FilerobotImageEditor value:', FilerobotImageEditor);
        
        filerobotImageEditor = new FilerobotImageEditor(
          editorContainer,
          config
        );
        console.log('FilerobotImageEditor initialized successfully');
        filerobotImageEditor.render({
          onClose: (closingReason) => {
            console.log('Editor closed', closingReason);
          }
        });
      } catch (error) {
        console.error('Error initializing FilerobotImageEditor:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  } else {
    console.error('Editor container not found');
  }
}

function openEditor() {
  const uploadedImage = document.getElementById('uploadedImage');
  if (uploadedImage.src) {
    initializeFilerobotEditor(uploadedImage.src);
  } else {
    alert('Please upload an image first.');
  }
}

function waitForFilerobotScript() {
  if (typeof FilerobotImageEditor !== 'undefined') {
    initializeFilerobotEditor();
  } else {
    console.log('Waiting for FilerobotImageEditor to load...');
    setTimeout(waitForFilerobotScript, 100);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  const openEditorButton = document.getElementById('openEditorButton');
  if (openEditorButton) {
    openEditorButton.addEventListener('click', openEditor);
  } else {
    console.error('Open editor button not found');
  }
});
