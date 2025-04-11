/**
 * @typedef {'correct' | 'present' | 'absent'} TileState
 * @typedef {[string, TileState]} Tile
 * @typedef {Tile[]} Word
 * @typedef {Word[]} GameProgress
 */

/**
 * Parses the Wordle game state from the page into a structured array representation
 * @param {Document} document - The DOM document containing the Wordle game
 * @returns {GameProgress} Array of guessed words, each containing 5 tiles with letter and state
 */
function parseGameProgress(document) {
    // Find all rows in the game board
    const rows = document.querySelectorAll('[role="group"][aria-label^="Row"]');
    const gameProgress = [];

    for (const row of rows) {
        const tiles = row.querySelectorAll('[role="img"][aria-roledescription="tile"]');
        const word = [];
        
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            const state = tile.getAttribute('data-state');
            const letter = tile.textContent.toUpperCase();
            
            // Map the state to our enum
            if (!['correct', 'present', 'absent'].includes(state)) continue;
            const tileState = state;
            
            word.push([letter, tileState]);
        }
        
        // Only add non-empty words
        if (word.length === 5) {
            gameProgress.push(word);
        }
    }

    return gameProgress;
}

/**
 * Converts the game progress into a summary format
 * @param {GameProgress} gameProgress - Array of guessed words with their states
 * @returns {Object} Summary of the game state
 */
function summarizeGameProgress(gameProgress) {
    let current_state = '_____';
    let letters_in_unknown_position = [];
    let letters_known_not_present = [];

    // First pass: Process correct letters
    for (const word of gameProgress) {
        for (let i = 0; i < word.length; i++) {
            const [letter, state] = word[i];
            if (state === 'correct') {
                current_state = current_state.substring(0, i) + letter + current_state.substring(i + 1);
            }
        }
    }

    // Second pass: Process present and absent letters
    for (const word of gameProgress) {
        for (let i = 0; i < word.length; i++) {
            const [letter, state] = word[i];
            
            if (state === 'present' && !current_state.includes(letter)) {
                // Only add to unknown position if not already in a correct position
                if (!letters_in_unknown_position.includes(letter)) {
                    letters_in_unknown_position.push(letter);
                }
            } else if (state === 'absent' && !current_state.includes(letter)) {
                // Only add to not present if not in a correct position
                if (!letters_known_not_present.includes(letter)) {
                    letters_known_not_present.push(letter);
                }
            }
        }
    }

    return {
        current_state,
        letters_in_unknown_position,
        letters_known_not_present
    };
}

// Export the functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseGameProgress, summarizeGameProgress };
} 