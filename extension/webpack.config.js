const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: './popup/popup.js',
    background: './background/background.js',
    options: './options/options.js',
    content: './content/content.js'
  },
  output: {
    filename: '[name]/[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        // Exclude test files from being processed
        test: /\.(test|spec)\.js$/,
        exclude: /(__tests__|cypress)/,
        use: 'null-loader'
      }
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'icons', to: 'icons' },
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'popup/popup.html', to: 'popup/popup.html' },
        { from: 'popup/popup.css', to: 'popup/popup.css' },
        { from: 'options/options.html', to: 'options/options.html' },
        { from: 'content/content.css', to: 'content/content.css' },
        // Copy specific lib files instead of the entire directory
        { from: '../lib/index.js', to: 'lib/index.js' },
        { from: '../lib/wordle_solver.js', to: 'lib/wordle_solver.js' },
        { from: '../lib/wordle_parser.js', to: 'lib/wordle_parser.js' },
        { from: '../lib/package.json', to: 'lib/package.json' },
        // Copy the API key file
        { from: '../api_key.json', to: 'api_key.json' }
      ],
    }),
  ],
  resolve: {
    alias: {
      '@wordle-solver/lib': path.resolve(__dirname, '../lib')
    }
  },
  // Exclude test files from the build
  externals: {
    'jest': 'jest',
    'cypress': 'cypress'
  }
}; 
