import react from '@vitejs/plugin-react';

import { defineConfig } from "vite";

export default defineConfig(async () => {
  const glsl = await (await import ('vite-plugin-glsl')).default;

  return {
    plugins: [react(), glsl()],
  }
});
