import hljs from 'highlight.js';
import esprima from 'esprima';
import { parse } from 'java-parser';
import 'highlight.js/styles/a11y-dark.css';
import './styles.css';

class HighlightHero {
  constructor(options) {
    this.options = options || {};
    
       // Add event listener for handling copy button clicks
       if (typeof document !== 'undefined') {
       document.addEventListener('click', this.handleCopyClick.bind(this));
       }
  }

  /* Code Highlighting 
  * Done using Highlight.js
  */
  highlight(text, language = 'plaintext') {
    if (hljs.getLanguage(language)) {
      return hljs.highlight(text, { language }).value;
    }
    return hljs.highlightAuto(text).value; // Auto-detect language
  }

  // Method to handle copying code to clipboard
  handleCopyClick(event) {
    if (event.target.classList.contains('copy')) {
      const codeBlock = event.target.closest('.code-block');
      if (codeBlock) {
        const codeElement = codeBlock.querySelector('code.hljs');
        if (codeElement) {
          const range = document.createRange();
          range.selectNode(codeElement);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);

          try {
            const successful = document.execCommand('copy');
            const msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
          } catch (err) {
            console.log('Unable to copy text');
          }

          window.getSelection().removeAllRanges();
        }
      }
    }
  }

  /* Extract Code Block - Used to extract the code from markdown text ``` 
  * Acceptable Inputs are - 
  * 1. Just the code within enclosed ``` 
  * ``` 
  *   <code> 
  * ```
  * 
  * 2. The Language along with Code 
  * ```[Language-name]
  *   <code>
  * ```
  * 
  * 3. Language and the meta-data along with code. This meta data triggers features of the library
  * ```[Language-name] [Meta Info]
  *   <code>
  * ```
  * 
  * Output - 
  * codeBlocks array containing - Language, Meta and Code
  */
  extractCodeBlocks(markdownText) {
    const codeBlockRegex = /```(\w+)?(?:[ \t]*([^\n]*))?\n([\s\S]*?)```/g;
    let match;
    const codeBlocks = [];
     // Loop through all the code blocks in markdown text
    while ((match = codeBlockRegex.exec(markdownText)) !== null) {
      const [_, lang, rawMeta, code] = match;
      codeBlocks.push({ lang, rawMeta, code });
    }
    return codeBlocks;
  }

  createMetaInfo(rawMeta){
    const metaData = {
      title: "",
      line_number: 0,
      check_syntax: 0,
      line_highlight: {
          range_with_color: [],
          range: [],
          single_with_color: [],
          single: []
      },
      word_highlight: {
          global: [],
          word_on_line: []
      }
  };

    const line_number_regex = /ln/g;
    const check_syntax_regex = /check/g;
    const title_regex = /name=\{([^}]*)\}/g;
    // const line_highlight_regex = /lh=\{(?:\d+|\[\d+(-\d+)?,\S\])(,(?:\d+|\[\d+(-\d+)?,\S\]))*\}/g;
    const line_highlight_regex = /lh=\{(?:\d+|\d+,[GR]|\d+-\d+|\d+-\d+,[GR])(?: \d+| \d+,[GR]| \d+-\d+| \d+-\d+,[GR])*\}/g;
    // const word_highlight_regex = /wh=\{(?:\s*\[\w+(?:,\s*\d+)?\]\s*|\w+)(?:,\s*(?:\[\w+(?:,\s*\d+)?\]|\w+))*\}/g;
    const word_highlight_regex = /wh=\{(?:\S+|\[\S+,\d+\])(?: (?:\S+|\[\S+,\d+\]))*\}/g;

    // Process Line Numbering
    const line_number_match = rawMeta.match(line_number_regex);
    (line_number_match)?metaData["line_number"]=1:metaData["line_number"]=0;

    // Processing Check Syntax
    const check_syntax_match = rawMeta.match(check_syntax_regex);
    (check_syntax_match)?metaData["check_syntax"]=1:metaData["check_syntax"]=0;

    // Process Title
    const title_match = rawMeta.match(title_regex);
    if(title_match){
      let title = title_match[0].match(/"[^\"]*\"/g)[0].replace(/"/g, '');
      metaData["title"]=title;
    }

    // Process Line Highlights
    const line_highlight_match = rawMeta.match(line_highlight_regex);
    if (line_highlight_match) {
        const line_highlight = line_highlight_match[0].match(/=\{([^}]*)\}/)[1];
        let lines_array = line_highlight.split(' ');
  
        for(let i=0;i<lines_array.length;i++){
          if(lines_array[i].includes('-') && lines_array[i].includes(',')){
            let temp = lines_array[i].split(',');
            let lineRange = temp[0].split('-');
            let startLine = Number(lineRange[0]);
            let endLine = Number(lineRange[1]);
            let colorOfLine = temp[1]==='R'?0:1; // 0 - Red, 1 - Green
            metaData["line_highlight"]["range_with_color"].push([startLine, endLine, colorOfLine]);
          }else if(lines_array[i].includes('-')){
            let lineRange = lines_array[i].split('-');
            let startLine = Number(lineRange[0]);
            let endLine = Number(lineRange[1]);
            metaData["line_highlight"]["range"].push([startLine, endLine]);
          }else if(lines_array[i].includes(',')){
            let temp = lines_array[i].split(',');
            let line = Number(temp[0]);
            let colorOfLine = temp[1]==='R'?0:1; // 0 - Red, 1 - Green
            metaData["line_highlight"]["single_with_color"].push([line, colorOfLine]); 
          } else{
            let line = Number(lines_array[i]);
            metaData["line_highlight"]["single"].push(line);
          }
        }
    }

    // Process Word Highlights
    const word_highlight_match = rawMeta.match(word_highlight_regex);
    if (word_highlight_match) {
        const word_highlight = word_highlight_match[0].match(/=\{([^}]*)\}/)[1];
        let words_array = word_highlight.split(' ');

        for(let i=0;i<words_array.length;i++){
          if(words_array[i].includes(',')){
            let temp = words_array[i].split(',');
            let word = temp[0];
            let lineNumber = temp[1]; 
            metaData["word_highlight"]["word_on_line"].push([word, lineNumber]);
          }else{
            let word = words_array[i];
            metaData["word_highlight"]["global"].push(word);
          }
        }
    }
  
    return metaData;
  }

  // Change UI to add line numbers
  addLineNumbering(highlightedCode){
    const lines = highlightedCode.split('\n');
    for(let i=0;i<lines.length;i++){
      lines[i] = `<span class="line-number">${i+1}</span>${lines[i]}`;
    }
    
    return lines.join('\n');
  }

  // Change UI to add file name
  addFileName(highlightedCode, title){
    return `<div class="filename">${title}</div>`+highlightedCode;
  }

  // Change UI to add line highlighting
  addLineHighlighting(code, meta){
    const lines = code.split('\n');
    let highlightedLines = [];

    for(let i=0;i<lines.length;i++){
      let line = lines[i];
      if(meta["single"].includes(i+1)){
        line = `<span class="highlight-line">${line}</span>`;
      }
      if(meta["single_with_color"].length>0){
        for(let j=0;j<meta["single_with_color"].length;j++){
          if(meta["single_with_color"][j][0]==i+1){
            let color = meta["single_with_color"][j][1]==0?"highlight-red":"highlight-green";
            line = `<span class="${color}">${line}</span>`;
          }
        }
      }
      if(meta["range"].length>0){
        for(let j=0;j<meta["range"].length;j++){
          if(i+1>=meta["range"][j][0] && i+1<=meta["range"][j][1]){
            line = `<span class="highlight-line">${line}</span>`;
          }
        }
      }
      if(meta["range_with_color"].length>0){
        for(let j=0;j<meta["range_with_color"].length;j++){
          if(i+1>=meta["range_with_color"][j][0] && i+1<=meta["range_with_color"][j][1]){
            let color = meta["range_with_color"][j][2]==0?"highlight-red":"highlight-green";
            line = `<span class="${color}">${line}</span>`;
          }
        }
      }
      highlightedLines.push(line);
    }
    return highlightedLines.join('\n');
  }

  // Change UI to add word highlighting
  addWordHighlighting(code, meta){
    const lines = code.split('\n');
    let highlightedLines = [];
    for(let i=0;i<lines.length;i++){ 
      let line = lines[i];
      if(meta["word_on_line"].length>0){
        for(let j=0;j<meta["word_on_line"].length;j++){
          if(meta["word_on_line"][j][1]==i+1){
            let word = meta["word_on_line"][j][0];
            line = line.replace(new RegExp(word, 'g'), `<span class="highlight-word">${word}</span>`);
          }
        }
      }
      if(meta["global"].length>0){
        for(let j=0;j<meta["global"].length;j++){
          let word = meta["global"][j];
          line = line.replace(new RegExp(word, 'g'), `<span class="highlight-word">${word}</span>`);          
        }
      }
      highlightedLines.push(line);
    }
    return highlightedLines.join('\n');
  }

  parseJavascript(code) {
    let error = '';
    try {
      esprima.parseScript(code, {
        tolerant: true,
        loc: true,
        range: true,
        tokens: true
      });
    } catch (e) {
      if (e.lineNumber && e.column) {
        error = `Error detected in line ${e.lineNumber}, column ${e.column}`;
      } else {
        error = 'Error in the above code';
      }
    }
    return error;
  }

  parseJava(code) {
    let error = '';
    try {
      parse(code);
    } catch (e) {
      const regex = /line: (\d+), column: (\d+)/;
      const match = e.message.match(regex);
      if (match) {
        error = `Error detected in line ${parseInt(match[1], 10)}, column ${parseInt(match[2], 10)}`;
      } else {
        error = 'Error in the above code';
      }
    }
    return error;
  }

  checkSyntax(code, lang) {
    let error = '';

    if (lang === 'javascript') {
      error = this.parseJavascript(code);
    }

    if (lang === 'java') {
      error = this.parseJava(code);
    }

    return error;
  }

  HighlightCode(markdownText) {
    const codeBlocks = this.extractCodeBlocks(markdownText);
    
    // For Each code block 
    return codeBlocks.map(block => {
      let metaData =[];
      if(block.rawMeta)
        metaData = this.createMetaInfo(block.rawMeta);
      
      let highlightedCode = this.highlight(block.code, block.lang);

      if(metaData.line_number==1)
        highlightedCode = this.addLineNumbering(highlightedCode);

      highlightedCode = `<div class="code-block"><button class="copy">Copy</button><pre><code class="hljs">${highlightedCode}</code></pre></div>`

      if(metaData.title)
        highlightedCode = this.addFileName(highlightedCode, metaData.title);

      if(metaData.line_highlight)
        highlightedCode = this.addLineHighlighting(highlightedCode, metaData.line_highlight);
      
      if(metaData.word_highlight)
        highlightedCode = this.addWordHighlighting(highlightedCode, metaData.word_highlight);

      if(metaData.check_syntax==1){
        const syntaxErrors = this.checkSyntax(block.code, block.lang);
        if(syntaxErrors)
          highlightedCode = `${highlightedCode}<div class="error">${syntaxErrors}</div>`
      }

      return `<div id="markdown-output">${highlightedCode}</div>`
    }).join('\n');
  }
}

export default HighlightHero;
