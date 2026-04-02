# DH Reading Lab

**How to Go Digital in American Literary Studies**
十九世紀アメリカ文学を少しだけデジタルに読むための授業用アプリ

A lightweight, browser-based text analysis tool for introductory digital humanities courses. No installation, no coding, no server required — students open the URL and start analyzing immediately.

---

## Features / 機能

- **頻出語分析 / Word Frequency** — ストップワード除去あり / with stopword removal
- **KWIC (Key Word in Context)** — 語の前後文脈を一覧表示 / concordance view
- **分布グラフ / Distribution** — テキスト全体を20区間に分けて出現位置を可視化 / word occurrence across 20 segments

---

## Deploy to GitHub Pages / デプロイ方法

1. このリポジトリを Fork する / Fork this repository
2. **Settings → Pages → Branch: `main` → `/root` → Save**
3. 数分後に公開される / Published at:
   `https://<your-username>.github.io/<repo-name>/`

---

## Add Texts / テキストを追加する

`texts.js` の各エントリの `text:` フィールドに本文を貼り付けてください。

```javascript
// texts.js
{
  id: 'week05',
  title: 'The Devil and Tom Walker',
  author: 'Washington Irving',
  text: 'PASTE FULL TEXT HERE'  // ← ここに本文を貼り付ける
}
```

---

## License

- App code: [MIT License](LICENSE)
