import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Resolver para garantir que apenas uma cópia do React seja usada
  const reactPath = path.resolve('./node_modules/react');
  const reactDomPath = path.resolve('./node_modules/react-dom');
  
  return {
    server: {
      host: "localhost",
      port: 8080,
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 8080,
        clientPort: 8080
      },
      watch: {
        // Evitar recarregamentos desnecessários
        usePolling: true,
        interval: 100
      }
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin']
        }
      }),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, './src')
        },
        // Garante que apenas uma cópia do React seja carregada
        {
          find: 'react',
          replacement: reactPath
        },
        {
          find: 'react-dom',
          replacement: reactDomPath
        },
        // Garante que o React Query use a mesma instância do React
        {
          find: '@tanstack/react-query',
          replacement: path.resolve('./node_modules/@tanstack/react-query')
        }
      ]
    },
    // Otimização para evitar duplicação de dependências
    optimizeDeps: {
      include: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'react-dom/client',
        '@tanstack/react-query'
      ],
      esbuildOptions: {
        // Garante que o React seja incluído apenas uma vez
        loader: {
          '.js': 'jsx',
        },
      },
      force: true
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
        // Garante que o CommonJS seja transformado corretamente
        esmExternals: true
      },
      rollupOptions: {
        // Garante que o React seja externalizado corretamente
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
          }
        }
      }
    }
  };
});
