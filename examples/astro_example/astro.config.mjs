import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import astroHighlightHero from './astro-highlight-hero';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap(), astroHighlightHero()],
});
