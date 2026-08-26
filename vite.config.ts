import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path'

export default defineConfig(({ mode }) => {
  const isSingleFile = mode === 'singlefile'

  return {
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5174,
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 5174,
      strictPort: true,
    },
    build: {
      sourcemap: 'hidden',
      outDir: isSingleFile ? 'dist-single' : 'dist',
    },
    plugins: [
      tsconfigPaths(),
      react({
        babel: {
          plugins: [
            'react-dev-locator',
          ],
        },
      }),
      traeBadgePlugin({
        variant: 'dark',
        position: 'bottom-right',
        prodOnly: true,
        clickable: true,
        clickUrl: 'https://www.trae.ai/solo?showJoin=1',
        autoTheme: true,
        autoThemeTarget: '#root'
      }),
      ...(isSingleFile ? [viteSingleFile()] : []),
    ],
  }
})
