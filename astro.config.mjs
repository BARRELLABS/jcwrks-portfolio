// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://jcwrks.com',
  // /publish is Jacob's internal "put my changes live" button — useful to him,
  // noise to Google. Keep it out of the sitemap (robots.txt blocks it too).
  integrations: [sitemap({ filter: (page) => !page.includes('/publish') })],
  vite: {
    plugins: [tailwindcss()]
  }
});
