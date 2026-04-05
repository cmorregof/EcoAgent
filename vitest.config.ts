// ---
// 📚 POR QUÉ: Configuración mínima de Vitest. Usa el resolver de TypeScript paths,
//    y configura globals para describe/it/expect sin importarlos en cada archivo.
// 📁 ARCHIVO: vitest.config.ts
// ---

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
    },
  },
});
