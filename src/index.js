// Import Highlight.js
const hljs = require('highlight.js');
require('highlight.js/styles/default.css');

class MarkdownHighlighter {
  constructor(options) {
    this.options = options || {};
  }

  highlight(text, language = 'plaintext') {
    if (hljs.getLanguage(language)) {
      return hljs.highlight(text, { language }).value;
    }
    return hljs.highlightAuto(text).value; // Auto-detect language
  }


 // Example of using regex for simple markdown transformation
 markdownToHTML(markdownText) {
  return markdownText
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }
}

module.exports = MarkdownHighlighter;
