import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Tests arrive with the lib/ tasks; until then an empty run should still pass.
    passWithNoTests: true,
  },
});
