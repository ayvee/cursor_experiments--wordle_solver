(This was an experiment with AI-generated code, using the Cursor code editor.)

# Wordle Solver

An AI-powered Wordle solver with both automated testing and an interactive Chrome extension.

## Project Structure

- `lib/`: Core libraries for parsing and solving Wordle puzzles
  - `wordle_parser.js`: Parses the Wordle game state
  - `wordle_solver.js`: AI-powered solver logic
  - `__tests__/`: Unit tests for core libraries

- `cypress/`: Automated testing of the solver against the live Wordle game
  - `e2e/wordle.cy.js`: End-to-end test of the solver

- `extension/`: Chrome extension for interactive solving
  - `popup/`: Extension popup UI
  - `content/`: Content scripts for game interaction
  - `background/`: Background scripts

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up API key:
   - Copy `api_key.example.json` to `api_key.json`
   - Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key
   - Note: `api_key.json` is in `.gitignore` to prevent accidentally committing your API key

3. Run tests:
   ```bash
   # Run all tests
   npm test

   # Run only library unit tests
   npm run test:lib

   # Run Cypress tests
   npm run test:cypress

   # Run Wordle solver test
   npm run test:wordle
   ```

4. Build Chrome extension:
   ```bash
   npm run build:extension
   ```

5. Development:
   ```bash
   # Watch mode for extension
   npm run dev:extension

   # Open Cypress test runner
   npm run cypress:open
   ```

## Chrome Extension

To install the extension in Chrome:

1. Build the extension using `npm run build:extension`
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `extension/dist` directory 