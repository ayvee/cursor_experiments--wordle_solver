const { parseGameProgress, summarizeGameProgress } = require('./wordle_parser');

// API key will be loaded dynamically in browser environment
let apiKey = null;

/**
 * Sets the API key for use in the solver
 * @param {string} key - The Gemini API key
 */
function setApiKey(key) {
  apiKey = key;
}

/**
 * Queries Gemini AI model for the next guess based on the current game state
 * @param {Object} gameState - Current game state from summarizeGameProgress
 * @param {string} [model] - The Gemini model to use (default: 'gemini-2.0-flash-lite')
 * @returns {Promise<string[]>} Array of suggested guesses
 */
async function queryAIModel(gameState, model = 'gemini-2.0-flash-lite') {
  const { current_state, letters_in_unknown_position, letters_known_not_present } = gameState;
  
  // Format the game state for Gemini
  const prompt = `You are playing Wordle in HARD MODE. In hard mode, any revealed hints MUST be used in subsequent guesses.
- Current word pattern: ${current_state} (where _ represents unknown letters)
- Letters in wrong positions (yellow): ${letters_in_unknown_position.join(', ') || 'none'}
- Letters not in word (gray): ${letters_known_not_present.join(', ') || 'none'}

Suggest the three best next 5-letter words to guess. The words must be valid English words.
IMPORTANT: In hard mode, your suggestions MUST include all yellow letters (${letters_in_unknown_position.join(', ') || 'none'}) and MUST match the current pattern (${current_state}).
Respond with ONLY the three 5-letter words in uppercase, one per line, nothing else.`;

  try {
    if (!apiKey) {
      throw new Error('API key not set. Please call setApiKey() before using the solver.');
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text.trim();
    
    // Split the response into lines and process each line
    const guesses = responseText.split('\n')
      .map(line => line.trim().toUpperCase())
      .filter(word => /^[A-Z]{5}$/.test(word))
      .slice(0, 3); // Take only the first 3 valid guesses
    
    // Validate that we got at least one 5-letter word
    if (guesses.length === 0) {
      throw new Error('Invalid response format from Gemini');
    }
    
    return guesses;
  } catch (error) {
    console.error('Error querying Gemini:', error);
    return null;
  }
}

/**
 * Gets all possible guesses based on the game progress parsed from the document
 * @param {Document} document - DOM document
 * @param {string} [model] - The Gemini model to use
 * @returns {Promise<string[]>} Array of suggested guesses or null if AI fails
 */
async function getAllGuesses(document, model) {
  const gameProgress = parseGameProgress(document);
  const gameState = summarizeGameProgress(gameProgress);
  
  // Get guesses from the AI model
  const guesses = await queryAIModel(gameState, model);
  
  // Log all guesses returned by the AI
  if (guesses && guesses.length > 0) {
    console.log('All AI suggested guesses:');
    guesses.forEach((guess, index) => {
      console.log(`Guess ${index + 1}: ${guess}`);
    });
  } else {
    console.log('No guesses returned from AI');
  }
  
  return guesses;
}

/**
 * Gets the next guess based on the game progress parsed from the document
 * @param {Document} document - DOM document
 * @param {string} [model] - The Gemini model to use
 * @returns {Promise<string>} Best next guess or null if AI fails
 */
async function getNextGuess(document, model) {
  const guesses = await getAllGuesses(document, model);
  return guesses && guesses.length > 0 ? guesses[0] : null;
}

// Export only the public functions
module.exports = {
  queryAIModel,
  getAllGuesses,
  getNextGuess,
  setApiKey
}; 