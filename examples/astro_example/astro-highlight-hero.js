import HighlightHero from 'highlight-hero';
import { visit } from 'unist-util-visit';

const highlighter = new HighlightHero();

export default function astroHighlightHero() {
  return {
    name: 'astro-highlight-hero',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          markdown: {
            remarkPlugins: [
              () => async (tree) => {

                visit(tree, 'code', (node) => {
                  const { lang, meta, value } = node;
                  if (value) {
                    
                    const codeBlock = `\`\`\`${lang || ''} ${meta || ''}\n${value}\n\`\`\``;
                    
                    const highlightedCode = highlighter.HighlightCode(codeBlock);

                    node.type= 'html';
                    node.value = highlightedCode;
                  }
                });
              },
            ],
          },
        });
      },
    },
  };
}
