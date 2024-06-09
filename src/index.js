const hljs = require('highlight.js');
const MarkdownIt = require('markdown-it');
require('highlight.js/styles/default.css');

class MarkdownHighlighter {
  constructor(options) {
    this.options = options || {};
    this.md = new MarkdownIt({
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return '<pre class="hljs"><code>' +
                   hljs.highlight(str, { language: lang }).value +
                   '</code></pre>';
          } catch (__) {}
        }

        return '<pre class="hljs"><code>' + this.md.utils.escapeHtml(str) + '</code></pre>';
      }
    });
  }

  highlight(text, language = 'plaintext') {
    text = this.markdownToHTML(text);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    tempDiv.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
    return tempDiv.innerHTML;
  }

  // Method to parse the code block and log the meta information
  parseCodeBlock(codeBlock) {
    const metaInfo = codeBlock.match(/```(\w+)\s+([\s\S]*?)\n/);
    if (metaInfo) {
      console.log(metaInfo[2]); // Log the meta information
      return codeBlock.replace(metaInfo[0], `\`\`\`${metaInfo[1]}\n`); // Remove the meta info line
    }
    return codeBlock;
  }

  markdownToHTML(markdownText) {
    const codeBlockRegex = /```(\w+)[\s\S]*?\n([\s\S]*?)```/g;
    const transformedMarkdown = markdownText.replace(codeBlockRegex, (match) => {
      return this.parseCodeBlock(match);
    });
    return this.md.render(transformedMarkdown);
  }
}

module.exports = MarkdownHighlighter;
