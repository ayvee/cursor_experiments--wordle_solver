import { getNextGuess } from '../../lib';

describe('Wordle Solver', () => {
  beforeEach(() => {
    // Visit the Wordle page and wait for it to load
    cy.visit('https://www.nytimes.com/games/wordle/index.html', {
      timeout: 30000 // Increase timeout for initial page load
    })
  })

  it('should make guesses and log progress', () => {
    // Wait for the page to be fully loaded
    cy.get('body').should('be.visible')

    // Handle the "Continue" button if it appears
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Continue")').length > 0) {
        cy.contains('button', 'Continue').should('be.visible').click()
      }
    })

    // Handle the "Play" button if it appears
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Play")').length > 0) {
        cy.contains('button', 'Play').should('be.visible').click()
      }
    })

    // Close any popups by pressing Escape
    cy.get('body').type('{esc}')

    // Wait for the game board to be ready
    cy.get('#wordle-app-game').should('exist')
    
    // Wait for the page to be fully loaded
    cy.wait(1000)
    // Close any remaining popups
    cy.get('body').type('{esc}')
    
    // Make sure the game is ready for input
    cy.wait(2000)
    
    // Log the current state of the game board
    // cy.document().then(doc => {
    //   cy.log('Initial game state before any guesses');
    //   const progress = parseGameProgress(doc);
    //   cy.log('Initial progress:', JSON.stringify(progress, null, 2));
    // });

    // Function to enter a word letter by letter
    const enterWord = (word) => {
      cy.log(`Entering word: ${word}`);
      
      // Click on the game board to ensure focus
      cy.get('#wordle-app-game').click();
      
      // Type each letter individually
      for (let i = 0; i < word.length; i++) {
        cy.get('body').type(word[i]);
        cy.wait(100); // Small delay between letters
      }
      
      // Press enter to submit
      cy.get('body').type('{enter}');
      cy.wait(3000); // Wait for animation
    };

    // Function to get and enter the next guess from the AI
    const makeNextGuess = () => {
      cy.document().then(async (doc) => {
        const nextGuess = await getNextGuess(doc);
        if (nextGuess) {
          cy.log(`AI suggests: ${nextGuess}`);
          enterWord(nextGuess);
        } else {
          cy.log('Failed to get next guess from AI');
        }
      });
    };

    // Make first guess: CRANE
    enterWord('CRANE');

    // Log progress after first guess
    // cy.document().then(doc => {
    //   const progress = parseGameProgress(doc);
    //   const summary = summarizeGameProgress(progress);
      
    //   cy.log('Progress after CRANE:', JSON.stringify(progress, null, 2));
    //   cy.log('Summary after CRANE:', JSON.stringify(summary, null, 2));
    // });

    // Make second guess: FLAME
    enterWord('FLAME');

    // Log progress after second guess
    // cy.document().then(doc => {
    //   const progress = parseGameProgress(doc);
    //   const summary = summarizeGameProgress(progress);
      
    //   cy.log('Progress after FLAME:', JSON.stringify(progress, null, 2));
    //   cy.log('Summary after FLAME:', JSON.stringify(summary, null, 2));
    // });

    // Make one guess using AI
    makeNextGuess();
  })
})