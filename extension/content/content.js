import { getNextGuess, getAllGuesses, setApiKey } from '@wordle-solver/lib';

// Load API key from api_key.json
async function loadApiKey() {
  try {
    const response = await fetch(chrome.runtime.getURL('api_key.json'));
    const data = await response.json();
    setApiKey(data.gemini_api_key);
    console.log('API key loaded successfully');
  } catch (error) {
    console.error('Error loading API key:', error);
  }
}

// Load API key when the content script is initialized
loadApiKey();

// Get the selected model from storage
async function getSelectedModel() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      { geminiModel: 'gemini-2.0-flash-lite' },
      (items) => resolve(items.geminiModel)
    );
  });
}

// Create and inject the overlay
function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'wordle-solver-overlay';

  const container = document.createElement('div');
  container.className = 'container';

  const title = document.createElement('h2');
  title.textContent = 'Wordle Solver';

  const button = document.createElement('button');
  button.textContent = 'Get Suggestion';

  const timer = document.createElement('div');
  timer.id = 'wordle-solver-timer';
  timer.style.display = 'none';

  const suggestion = document.createElement('div');
  suggestion.id = 'wordle-solver-suggestion';

  const status = document.createElement('div');
  status.id = 'wordle-solver-status';

  container.appendChild(title);
  container.appendChild(button);
  container.appendChild(timer);
  container.appendChild(suggestion);
  container.appendChild(status);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  return { button, status, timer, suggestion };
}

// Initialize overlay and set up event listeners
const { button, status, timer, suggestion } = createOverlay();

// Timer variables
let timerInterval;
let startTime;

const startTimer = () => {
  startTime = Date.now();
  timer.style.display = 'block';
  timer.textContent = 'Elapsed time: 0s';
  
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timer.textContent = `Elapsed time: ${elapsed}s`;
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerInterval);
  const elapsed = (Date.now() - startTime) / 1000;
  return elapsed.toFixed(1);
};

const showStatus = (message, isError = false) => {
  status.textContent = message;
  status.style.display = 'block';
  status.style.backgroundColor = isError ? '#FFEBEE' : '#E8F5E9';
  status.style.color = isError ? '#C62828' : '#2E7D32';
};

const showSuggestion = (suggestionText) => {
  if (Array.isArray(suggestionText)) {
    suggestion.innerHTML = '<div class="suggestion-title">Suggested words:</div>';
    const list = document.createElement('div');
    list.className = 'suggestion-list';
    
    suggestionText.forEach(word => {
      const wordElement = document.createElement('div');
      wordElement.className = 'suggestion-word';
      wordElement.textContent = word;
      list.appendChild(wordElement);
    });
    
    suggestion.appendChild(list);
  } else {
    suggestion.textContent = `Suggested word: ${suggestionText}`;
  }
  suggestion.style.display = 'block';
};

button.addEventListener('click', async () => {
  try {
    button.disabled = true;
    const model = await getSelectedModel();
    showStatus(`Getting suggestion using ${model}`);
    startTimer();

    const result = await getAllGuesses(document, model);

    const elapsedTime = stopTimer();
    timer.style.display = 'none';  // Hide the timer    
    showSuggestion(result);
    showStatus(`Suggestion ready! (${elapsedTime}s using ${model})`);
  } catch (error) {
    console.error('Error:', error);
    stopTimer();
    timer.style.display = 'none';  // Also hide timer on error
    showStatus('An error occurred while getting the suggestion: ' + error.message, true);
  } finally {
    button.disabled = false;
  }
}); 