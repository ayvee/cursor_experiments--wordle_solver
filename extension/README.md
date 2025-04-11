# Wordle Solver Chrome Extension

A Chrome extension that provides AI-powered suggestions for the Wordle game.

## Features

- Get AI-powered suggestions for your next Wordle guess
- Works with the official NYT Wordle game
- Adds a convenient button to the Wordle page
- Copy suggestions to clipboard with one click

## Development

### Prerequisites

- Node.js and npm

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. For development with hot reloading:
   ```bash
   npm run dev
   ```

### Loading the Extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` directory

## Usage

1. Navigate to the NYT Wordle game
2. Click the extension icon in your browser toolbar
3. Click "Get Suggestions" to see AI-powered suggestions
4. Click on a suggestion to copy it to your clipboard

## Configuration

You can configure the extension by clicking the "Options" button in the popup.

## License

MIT 