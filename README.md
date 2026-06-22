# atui
Atuiは日本の高校生が一から開発したアシスタントです。
これは現在サポートされている、すべての端末・OSで動くことを目標に作られました。
現在、https://atui.pages.dev にて公開されています。
詳しくはフォーク元をご覧ください: https://github.com/mangagroup712-design/atui


# atui-remaked
現在、https://manmen2414.github.io/atui-remaked/ にて公開されています。

## About Remake
Atui Remakedは、Atuiをより安全に、ユーザーにとっても開発者にとっても扱いやすく、多くの機能を持った便利なアシスタントとすることを目標に大胆な改変を行うプロジェクトです。

## What Can I Do?
Atui RemakedはAtuiに元々搭載されていた全ての機能を引き継いでいます。

以下はAtui Remakedで利用できる追加機能の一覧です：

 - `郵便番号` remaked版でハイフンありを許容するようになりました。
 - `消火` `着火`  atuiを消火、着火できます。消火中はまともにしゃべりません。 
 - `じゃんけん`  atuiとじゃんけんできます。
 - `機能` Atuiにインストールされている機能を表示します。
 - `強制停止` しりとりなどでバグが発生した際に強制的に通常モードに戻します。**テキスト完全一致で実行です。**

## Development Environment
リメイク時にコード方針や使用ツールを大幅に見直し、より安全で高度な開発を可能にしました。
- ✅ `vite`によるコードバンドル
- ✅ `TypeScript`を用いた型安全なコード設計
- ✅ HTMLとAtui本体が直接結びつかない疎結合型プログラム
- ✅ スマホとデスクトップを単一ファイルに統一

## Build / Development Server
1. リポジトリをクローンします。
2. `npm i`でパッケージをインストールします。
3. `npm run dev`で開発用サーバーが`http://localhost:5173`で自動的に起動します。
5. `npm run build`で`dist/`下にバンドルされたatuiウェブアプリが出力されます。