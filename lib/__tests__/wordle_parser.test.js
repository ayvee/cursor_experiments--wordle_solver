const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { parseGameProgress, summarizeGameProgress } = require('../wordle_parser');

describe('Example file parsing', () => {
    test('correctly parses example_partly_solved.mhtml', () => {
        // Read and decode the MHTML file
        let mhtmlContent = fs.readFileSync(
            path.join(__dirname, 'reference_pages', 'example_partly_solved.mhtml'),
            'utf8'
        );

        // Decode MHTML quoted-printable encoding
        mhtmlContent = mhtmlContent
            .replace(/=3D/g, '=')
            .replace(/=\r?\n/g, '')
            .replace(/=([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));

        const dom = new JSDOM(mhtmlContent, {
            url: 'https://www.nytimes.com/games/wordle/index.html',
            contentType: 'text/html'
        });

        const gameProgress = parseGameProgress(dom.window.document);
        const summary = summarizeGameProgress(gameProgress);

        // First guess was CRANE:
        // - C: absent (grey)
        // - R: present (yellow)
        // - A: correct (green)
        // - N: absent (grey)
        // - E: correct (green)
        // Second guess was FLARE:
        // - F: absent (grey)
        // - L: absent (grey)
        // - A: correct (green)
        // - R: correct (green)
        // - E: correct (green)
        expect(gameProgress).toEqual([
            [
                ['C', 'absent'],
                ['R', 'present'],
                ['A', 'correct'],
                ['N', 'absent'],
                ['E', 'correct']
            ],
            [
                ['F', 'absent'],
                ['L', 'absent'],
                ['A', 'correct'],
                ['R', 'correct'],
                ['E', 'correct']
            ]
        ]);

        expect(summary).toEqual({
            current_state: '__ARE',  // A, R, E in correct positions
            letters_in_unknown_position: [],  // R was initially yellow but later found in correct position
            letters_known_not_present: ['C', 'N', 'F', 'L']  // All grey letters
        });
    });
});

describe('parseGameProgress', () => {
    test('parses a partly solved game correctly', () => {
        const dom = new JSDOM(`
            <div role="group" aria-label="Row 1">
                <div role="img" aria-roledescription="tile" data-state="correct">A</div>
                <div role="img" aria-roledescription="tile" data-state="present">B</div>
                <div role="img" aria-roledescription="tile" data-state="absent">C</div>
                <div role="img" aria-roledescription="tile" data-state="correct">D</div>
                <div role="img" aria-roledescription="tile" data-state="absent">E</div>
            </div>
            <div role="group" aria-label="Row 2">
                <div role="img" aria-roledescription="tile" data-state="empty"></div>
                <div role="img" aria-roledescription="tile" data-state="empty"></div>
                <div role="img" aria-roledescription="tile" data-state="empty"></div>
                <div role="img" aria-roledescription="tile" data-state="empty"></div>
                <div role="img" aria-roledescription="tile" data-state="empty"></div>
            </div>
        `);

        const result = parseGameProgress(dom.window.document);
        
        expect(result).toEqual([
            [
                ['A', 'correct'],
                ['B', 'present'],
                ['C', 'absent'],
                ['D', 'correct'],
                ['E', 'absent']
            ]
        ]);
    });

    test('handles multiple guessed words', () => {
        const dom = new JSDOM(`
            <div role="group" aria-label="Row 1">
                <div role="img" aria-roledescription="tile" data-state="correct">A</div>
                <div role="img" aria-roledescription="tile" data-state="present">B</div>
                <div role="img" aria-roledescription="tile" data-state="absent">C</div>
                <div role="img" aria-roledescription="tile" data-state="correct">D</div>
                <div role="img" aria-roledescription="tile" data-state="absent">E</div>
            </div>
            <div role="group" aria-label="Row 2">
                <div role="img" aria-roledescription="tile" data-state="absent">F</div>
                <div role="img" aria-roledescription="tile" data-state="present">G</div>
                <div role="img" aria-roledescription="tile" data-state="correct">H</div>
                <div role="img" aria-roledescription="tile" data-state="absent">I</div>
                <div role="img" aria-roledescription="tile" data-state="present">J</div>
            </div>
        `);

        const result = parseGameProgress(dom.window.document);
        
        expect(result).toEqual([
            [
                ['A', 'correct'],
                ['B', 'present'],
                ['C', 'absent'],
                ['D', 'correct'],
                ['E', 'absent']
            ],
            [
                ['F', 'absent'],
                ['G', 'present'],
                ['H', 'correct'],
                ['I', 'absent'],
                ['J', 'present']
            ]
        ]);
    });
});

describe('summarizeGameProgress', () => {
    test('correctly summarizes a partly solved game', () => {
        const gameProgress = [
            [
                ['P', 'present'],
                ['L', 'absent'],
                ['A', 'absent'],
                ['N', 'correct'],
                ['E', 'correct']
            ],
            [
                ['F', 'absent'],
                ['L', 'absent'],
                ['A', 'absent'],
                ['M', 'absent'],
                ['E', 'correct']
            ]
        ];

        const result = summarizeGameProgress(gameProgress);
        
        expect(result).toEqual({
            current_state: '___NE',
            letters_in_unknown_position: ['P'],
            letters_known_not_present: ['L', 'A', 'F', 'M']
        });
    });

    test('handles duplicate letters correctly', () => {
        const gameProgress = [
            [
                ['E', 'present'],
                ['A', 'absent'],
                ['R', 'present'],
                ['T', 'absent'],
                ['H', 'absent']
            ]
        ];

        const result = summarizeGameProgress(gameProgress);
        
        expect(result).toEqual({
            current_state: '_____',
            letters_in_unknown_position: ['E', 'R'],
            letters_known_not_present: ['A', 'T', 'H']
        });
    });

    test('correctly summarizes CRANE guess', () => {
        const gameProgress = [
            [
                ['C', 'absent'],
                ['R', 'present'],
                ['A', 'correct'],
                ['N', 'absent'],
                ['E', 'correct']
            ]
        ];

        const result = summarizeGameProgress(gameProgress);
        
        expect(result).toEqual({
            current_state: '__A_E',
            letters_in_unknown_position: ['R'],
            letters_known_not_present: ['C', 'N']
        });
    });

    test('correctly summarizes CRANE followed by FLAME', () => {
        const gameProgress = [
            [
                ['C', 'absent'],
                ['R', 'present'],
                ['A', 'correct'],
                ['N', 'absent'],
                ['E', 'correct']
            ],
            [
                ['F', 'absent'],
                ['L', 'absent'],
                ['A', 'correct'],
                ['M', 'absent'],
                ['E', 'correct']
            ]
        ];

        const result = summarizeGameProgress(gameProgress);
        
        expect(result).toEqual({
            current_state: '__A_E',
            letters_in_unknown_position: ['R'],
            letters_known_not_present: ['C', 'N', 'F', 'L', 'M']
        });
    });
}); 