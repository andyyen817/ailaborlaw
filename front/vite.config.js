import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  // 建置優化配置
  build: {
    // 代碼分割設定
    rollupOptions: {
      output: {
        manualChunks: {
          // 核心框架
          'vue-vendor': ['vue', 'vue-router'],
          
          // UI組件庫
          'ui-vendor': ['@fortawesome/fontawesome-free'],
          
          // 表單驗證
          'validation-vendor': ['vee-validate', '@vee-validate/rules'],
          
          // 工具庫
          'utils-vendor': ['papaparse']
        },
        // 優化文件名
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // 壓縮設定
    minify: 'esbuild',
    
    // 資源優化
    assetsInlineLimit: 4096, // 小於4KB的資源內聯
    
    // Target設定 - 支援 top-level await
    target: 'esnext',
    
    // 移除控制台輸出 (生產環境)
    esbuild: {
      drop: ['console', 'debugger'],
      target: 'esnext'
    },
    
    // 提高chunk大小警告閾值
    chunkSizeWarningLimit: 1000,
    
    // 啟用源碼映射（開發環境）
    sourcemap: true
  },
  server: {
    host: "0.0.0.0",
    port: 3001,            
    strictPort: true,      
    force: true,
    hmr: true,
    allowedHosts: ['localhost', '127.0.0.1'],
    proxy: {
      '/api/v1': {
        target: 'http://localhost:7070',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        timeout: 60000,
        proxyTimeout: 60000
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    // enable jest-like global test APIs
    globals: true,
    // simulate DOM with jsdom
    environment: 'jsdom',
    // 排除 storybook 文件
    exclude: ['**/node_modules/**', '**/dist/**', '**/.{idea,git,cache,output,temp}/**', '**/*.stories.js']
  }
})
