// Background script for the Wordle Solver extension

// Listen for installation
chrome.runtime.onInstalled.addListener(function() {
  console.log('Wordle Solver extension installed');
});

// Handle extension button click
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle overlay
  chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay' });
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getApiKey') {
    // In a real implementation, you would securely store and retrieve the API key
    // For now, we'll just return a placeholder
    sendResponse({ apiKey: 'YOUR_API_KEY_HERE' });
  }
  return true;
}); 