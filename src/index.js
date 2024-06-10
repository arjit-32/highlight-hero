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
    const codeBlockRegex = /```(\w+)(?:[ \t]+([^\n]+))?\n([\s\S]*?)```/g;
    let match;
    const codeBlocks = [];
    
    while ((match = codeBlockRegex.exec(markdownText)) !== null) {
      const [_, lang, meta, code] = match;
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
      let codeWithHighlights="";
      
      if (block.meta) {

        // Line Highlighting
        const lineNumberRegex = /line_number={([^}]*)}/;
        const lineNumberMatch = block.meta.match(lineNumberRegex);
        const titleregex = /title={([^}]*)}/;
        const title = block.meta.match(titleregex);

        if (lineNumberMatch) {
          const temp = lineNumberMatch[1].split(',');
          const colorOfLine = temp[1].trim();
          const lineRange = temp[0].split('-');
          const startLine = lineRange[0];
          const endLine = lineRange[1];
          console.log(temp);
          console.log(colorOfLine);
          let highlightClass="highlight-line";
          if(colorOfLine=="r")  highlightClass="highlight-red";
          if(colorOfLine=="g")  highlightClass="highlight-green";
          
          
          highlightedLines = lines.map((line, index) => {
            if (index + 1 >= startLine && index + 1 <= endLine) {
              return `<span class="${highlightClass}">${line}</span>`;
            } else {
              return line;
            }
          });

          codeWithHighlights = highlightedLines.join('\n');
        }

        // Fileview
        if (title) {
          const temp = title[1];
          console.log(temp);
          codeWithHighlights = `<div class="filename"><p>${temp}</p>`+codeWithHighlights+`</div>`;
        }
      }
  
      
      return `<div class="code-block"><pre><code class="hljs">${codeWithHighlights}</code></pre></div>`;
    }).join('\n');
  }
  
  
}

module.exports = CodeHighlighter;
