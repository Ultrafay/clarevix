// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://clarevix.com',
  output: 'static',

  vite: {
    // Cast because astro and @tailwindcss/vite ship slightly different Vite
    // plugin types depending on their hoisted vite versions in node_modules.
    /** @type {any} */
    plugins: [tailwindcss()],
  },

  build: {
    inlineStylesheets: 'auto',
  },

  compressHTML: true,
  adapter: cloudflare()
});