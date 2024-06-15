const HighlightHero = require('highlight-hero');
const highlightHero = new HighlightHero();

const code = `
\`\`\`javascript
const x = 10;
console.log(x);
\`\`\`
`;

const highlighted = highlightHero.HighlightCode(code);
console.log(highlighted);
