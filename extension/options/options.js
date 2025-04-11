// Save options to chrome.storage
function saveOptions() {
  const model = document.getElementById('model').value;
  chrome.storage.sync.set(
    { geminiModel: model },
    () => {
      // Update status to let user know options were saved
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      status.className = 'status success';
      status.style.display = 'block';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    }
  );
}

// Restore select box state using the preferences stored in chrome.storage
function restoreOptions() {
  chrome.storage.sync.get(
    { geminiModel: 'gemini-2.0-flash-lite' }, // default value
    (items) => {
      document.getElementById('model').value = items.geminiModel;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions); 