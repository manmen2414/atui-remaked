import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  // ベースURL（GitHub Pagesなどにデプロイする場合は '/repository-name/' などに変更）
  base: "./",
  // プラグインの指定（ReactやVueを使う場合はここに追加します）
  plugins: [],
  // 開発サーバーの設定
  server: {
    port: 5173, // ポート番号
    open: true, // サーバー起動時にブラウザを自動で開く
  },
  // ビルド設定
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  // パス解決の設定
  resolve: {
    alias: {},
  },
});
