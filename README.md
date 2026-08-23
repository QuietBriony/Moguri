# Moguri

Moguriのイベント企画を、Google Driveで共同編集しながら公開する静的サイトです。

- 公開サイト: <https://quietbriony.github.io/Moguri/>
- 共同編集フォルダ: <https://drive.google.com/drive/folders/1T8rbeEmxREmp3vdy4n1kveQzF0Rn4Ny1>
- イベント入力: <https://docs.google.com/spreadsheets/d/16M7nRooOCL64B25zJI8CXBeX6TEbcLz82OIvaIkGTFs/edit>
- 企画・ページ反映マスター: <https://docs.google.com/spreadsheets/d/16fvqZbgGHQTyeABn92KsMDDK8ewJSQHjElSjk7tiBNo/edit>

現在の公開基盤はGitHub Pagesです。Cloudflare Pagesへ接続する場合も、同じ安全な`dist/`を配信します。

## 情報の流れ

1. メンバーが「イベント入力」に追記する
2. `公開区分`を`公開`にしたイベントだけ、公開ページの一覧へ反映される
3. 詳細文や決定事項は「企画・ページ反映マスター」で確認してから手動反映する
4. AI作業用・会話メモ・解析データは公開ビルドへ含めない

## 内部資料と再現性

サイトの再生成に必要なコード、ビルド手順、公開設定はこのリポジトリを正本とします。
音声・会話メモ・派生分析データは、所有者限定の`Moguri_AI作業用（内部・通常触らない）`フォルダを正本とし、公開GitHubでは追跡しません。

`scripts/analyze_audio.py`は残しているため、権限のある作業者が元音声を用意すれば分析を再実行できます。

## ローカル確認

```powershell
npm run check
npm run build
python -m http.server 8080 --directory dist
```

`http://localhost:8080`を開きます。

## 公開設定

GitHub Pagesは`.github/workflows/pages.yml`で`dist/`だけを公開します。

Cloudflare Pagesでは次を設定します。

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

pushと公開操作は、このワークスペースでは人の確認後に実施します。
