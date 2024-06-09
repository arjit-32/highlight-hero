const hljs = require('highlight.js');
require('highlight.js/styles/a11y-dark.css');
require('./styles.css');

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
      codeBlocks.push({ lang, meta, code });
    }
    
    return codeBlocks;
  }

  processMarkdown(markdownText) {
    const codeBlocks = this.extractCodeBlocks(markdownText);
    return codeBlocks.map(block => {
      const highlightedCode = this.highlight(block.code, block.lang);
      const lines = highlightedCode.split('\n');
      let highlightedLines = lines;

      
      if (block.meta) {
        const lineNumberRegex = /line_number={([^}]*)}/;
        const lineNumberMatch = block.meta.match(lineNumberRegex);
        
        if (lineNumberMatch) {
          const lineRange = lineNumberMatch[1].split('-').map(Number);
          const startLine = lineRange[0];
          const endLine = lineRange[1];
          
          
          highlightedLines = lines.map((line, index) => {
            if (index + 1 >= startLine && index + 1 <= endLine) {
              console.log(startLine, endLine );
              return `<span class="highlighted-line">${line}</span>`;
            } else {
              return line;
            }
          });
        }
      }
  
      const codeWithHighlights = highlightedLines.join('\n');
      console.log(codeWithHighlights)
      return `<div class="code-block"><pre><code class="hljs">${codeWithHighlights}</code></pre></div>`;
    }).join('\n');
  }
  
  
}

module.exports = CodeHighlighter;
