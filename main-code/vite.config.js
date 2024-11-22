import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss'; // Import Tailwind CSS
import autoprefixer from 'autoprefixer'; // Import Autoprefixer

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss, // Use Tailwind CSS
        autoprefixer, // Use Autoprefixer
      ],
    },
  },
});
