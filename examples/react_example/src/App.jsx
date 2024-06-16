import { useEffect, useState } from 'react'
import HighlightHero from '../node_modules/highlight-hero';  // Adjust the path if necessary

function App() {
  const [highlightedCode, setHighlightedCode] = useState('');

  useEffect(() => {
    const markdownText = `
\`\`\`java ln check
    import java.util.*;
    class Arjit{
      public static void main(String s[]){
        System.out.println("Hello World");
      }
    }
\`\`\`
    `;

    const highlighter = new HighlightHero();
    const html = highlighter.HighlightCode(markdownText);

    setHighlightedCode(html);
  }, []);

  return (
    <>
     <div>
      <h1>Markdown Code Highlighter</h1>
      <div id="result" dangerouslySetInnerHTML={{ __html: highlightedCode }}></div>
    </div>
    </>
  )
}

export default App
