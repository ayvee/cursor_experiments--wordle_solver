const { queryAIModel, setApiKey } = require('../wordle_solver');

// Mock fetch for testing
global.fetch = jest.fn();

describe('Wordle Solver', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = jest.fn();
    // Set a dummy API key for testing
    setApiKey('test-api-key');
  });

  describe('queryAIModel', () => {
    it('should format the game state correctly and return the AI response', async () => {
      // Mock the AI response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: 'STARE\nSPARE\nSHARE' }]
            }
          }]
        })
      });

      const gameState = {
        current_state: '__ARE',
        letters_in_unknown_position: ['R'],
        letters_known_not_present: ['C', 'N', 'E', 'F', 'L']
      };

      const result = await queryAIModel(gameState);

      // Check that fetch was called with the correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-2.0-flash-lite:generateContent'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('__ARE')
        })
      );

      // Check the result
      expect(result).toEqual(['STARE', 'SPARE', 'SHARE']);
    });

    it('should use the specified model when provided', async () => {
      // Mock the AI response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: 'STARE\nSPARE\nSHARE' }]
            }
          }]
        })
      });

      const gameState = {
        current_state: '__ARE',
        letters_in_unknown_position: ['R'],
        letters_known_not_present: ['C', 'N', 'E', 'F', 'L']
      };

      await queryAIModel(gameState, 'gemini-pro');

      // Check that fetch was called with the correct model
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-pro:generateContent'),
        expect.any(Object)
      );
    });

    it('should handle API errors gracefully', async () => {
      // Mock an API error
      global.fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'API Error'
      });

      const gameState = {
        current_state: '__ARE',
        letters_in_unknown_position: ['R'],
        letters_known_not_present: ['C', 'N', 'E', 'F', 'L']
      };

      const result = await queryAIModel(gameState);

      // Check that the function returns null on error
      expect(result).toBeNull();
    });

    it('should handle invalid response format', async () => {
      // Mock an invalid response format
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: 'INVALID RESPONSE' }]
            }
          }]
        })
      });

      const gameState = {
        current_state: '__ARE',
        letters_in_unknown_position: ['R'],
        letters_known_not_present: ['C', 'N', 'E', 'F', 'L']
      };

      const result = await queryAIModel(gameState);

      // Check that the function returns null for invalid format
      expect(result).toBeNull();
    });
  });
}); 