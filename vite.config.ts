/// <reference types="vitest" />

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vite.dev/config/
export default defineConfig(() => {
  const isGitHubPages = process.env.GITHUB_PAGES === "true"

  return {
    // GitHub Pages（プロジェクトサイト）ではサブパス配信のため base を設定
    // ローカル開発では "/" を使用し、dev 体験を損なわない
    base: isGitHubPages ? "/qr-generator-web/" : "/",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/test-setup.ts",
    },
  }
})
