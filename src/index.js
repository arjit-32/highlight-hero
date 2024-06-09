const hljs = require('highlight.js');
require('highlight.js/styles/a11y-dark.css');

class CodeHighlighter {
  constructor(options) {
    this.options = options || {};
  }

  highlight(text, language = 'plaintext') {
    if (hljs.getLanguage(language)) {
      return hljs.highlight(text, { language }).value;
    }
    return hljs.highlightAuto(text).value; // Auto-detect language
  }

  extractCodeBlocks(markdownText) {
    const codeBlockRegex = /```(\w+)(\s+.*)?\n([\s\S]*?)```/g;
    let match;
    const codeBlocks = [];
    
    while ((match = codeBlockRegex.exec(markdownText)) !== null) {
      const [_, lang, meta, code] = match;
      if (meta) {
        console.log(meta.trim()); // Log the meta information
      }
      codeBlocks.push({ lang, code });
    }
    
    return codeBlocks;
  }

  processMarkdown(markdownText) {
    const codeBlocks = this.extractCodeBlocks(markdownText);
    return codeBlocks.map(block => 
      `<pre class="hljs"><code>${this.highlight(block.code, block.lang)}</code></pre>`
    ).join('\n');
  }
}

module.exports = CodeHighlighter;
