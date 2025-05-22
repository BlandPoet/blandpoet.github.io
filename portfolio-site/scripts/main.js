function openWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'block';

  // Restore saved position and size
  const saved = JSON.parse(localStorage.getItem(id));
  if (saved) {
      win.style.left = saved.left;
      win.style.top = saved.top;
      win.style.width = saved.width;
      win.style.height = saved.height;
  } else {
      // center window if no cached state
      centerWindow(win);
  }
}

function closeWindow(id) {
  document.getElementById(id).style.display = 'none';
}

let offsetX, offsetY;
let dragTarget = null;

function startDrag(e, titleBar) {
  dragTarget = titleBar.parentElement;
  offsetX = e.clientX - dragTarget.offsetLeft;
  offsetY = e.clientY - dragTarget.offsetTop;
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', stopDrag);
}

function dragMove(e) {
  if (!dragTarget) return;
  dragTarget.style.left = (e.clientX - offsetX) + 'px';
  dragTarget.style.top = (e.clientY - offsetY) + 'px';
}

function stopDrag() {
  if (dragTarget) saveWindowState(dragTarget.id);
  dragTarget = null;
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', stopDrag);
}

// Function to center the window on the screen with a set size
function centerWindow(windowEl, width = 700, height = 500) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // determine screen position
  const left = (screenWidth - width) / 2;
  const top = (screenHeight - height) / 2;

  // Set the size and position of the window
  windowEl.style.width = width + 'px';
  windowEl.style.height = height + 'px';
  windowEl.style.left = left + 'px';
  windowEl.style.top = top + 'px';
}

// Save position and size
function saveWindowState(id) {
  const el = document.getElementById(id);
  const state = {
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
      height: el.style.height,
  };
  localStorage.setItem(id, JSON.stringify(state));
}

// Resize logic
document.querySelectorAll('.resizer').forEach((resizer) => {
  const windowEl = resizer.parentElement;
  let isResizing = false;

  const MIN_WIDTH = 300; // Minimum width in pixels
  const MIN_HEIGHT = 200; // Minimum height in pixels
  const MAX_WIDTH = 800; // Maximum width in pixels
  const MAX_HEIGHT = 600; // Maximum height in pixels

  resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizing = true;
      document.addEventListener('mousemove', resizeMove);
      document.addEventListener('mouseup', stopResize);
  });

  function resizeMove(e) {
      if (!isResizing) return;
      const rect = windowEl.getBoundingClientRect();
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX - rect.left));
      const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, e.clientY - rect.top));
      windowEl.style.width = newWidth + 'px';
      windowEl.style.height = newHeight + 'px';
  }

  function stopResize() {
      if (isResizing) saveWindowState(windowEl.id);
      document.removeEventListener('mousemove', resizeMove);
      document.removeEventListener('mouseup', stopResize);
      isResizing = false;
  }
});

let highestZIndex = 1; // hightest zindex

function bringToFront(windowEl) {
  highestZIndex++; // Increment the z-index
  windowEl.style.zIndex = highestZIndex; // Set the new z-index for the selected window
}

// Attach event listeners to all windows
document.querySelectorAll('.window').forEach((windowEl) => {
  windowEl.addEventListener('mousedown', () => {
      bringToFront(windowEl); // Bring the clicked window to the front
  });
});


function copyToClipboard(text, element) {
  navigator.clipboard.writeText(text).then(() => {
      // Show feedback message
      const feedback = document.getElementById('copy-feedback');
      feedback.style.display = 'block'; // make the message visible
      feedback.style.opacity = '1'; // check to see if is visible

      // Position the feedback box above the email
      const rect = element.getBoundingClientRect();
      feedback.style.left = `${rect.left}px`;
      feedback.style.top = `${rect.top - feedback.offsetHeight - 10}px`; // not fucking working

      // Fade out after 2 seconds
      setTimeout(() => {
          feedback.style.transition = 'opacity 1s ease';
          feedback.style.opacity = '0'; // Fade out
          setTimeout(() => {
              feedback.style.display = 'none'; // Hide after fading
          }, 1000); // Wait for fade-out to complete
      }, 2000);
  }).catch(err => {
      console.error('Failed to copy text: ', err);
  });
}