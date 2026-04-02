# DH Reading Lab

**How to Go Digital in American Literary Studies**
十九世紀アメリカ文学を少しだけデジタルに読むための授業用アプリ

A lightweight, browser-based text analysis tool for literary studies courses. No installation, no coding, no server required — just open the URL and start analyzing.

---

## Features / 機能

- **頻出語分析 / Word Frequency** — ストップワード除去あり
- **KWIC (Key Word in Context)** — 語の前後文脈を一覧表示
- **分布グラフ / Distribution** — テキスト全体を20区間に分けて出現位置を可視化
- **実験メモ / Experiment Memo** — 分析結果をGoogle Classroomにコピペ提出

---

## Deploy to GitHub Pages / デプロイ方法

1. このリポジトリを GitHub で Fork またはクローン
2. Settings → Pages → Branch: `main` → `/root` → Save
3. 数分後に `https://<your-username>.github.io/<repo-name>/` が公開される
4. そのURLをGoogle ClassroomのMaterialとして貼り付ける

---

## Add Texts / テキストを追加する

`index.html` 内の `PRESET_TEXTS` 配列を編集してください。

```javascript
{
  id: 'week02',
  week: 2,
  title: 'Somnambulism: A Fragment',
  author: 'Charles Brockden Brown',
  suggestedKeywords: ['sleep', 'dream', 'walk', 'eye', 'night', 'darkness'],
  coreQuestion: {
    ja: '夢遊と意識の揺らぎは語彙レベルでどう現れるか',
    en: 'How does the instability of sleepwalking and consciousness appear at the level of vocabulary?'
  },
  text: 'PASTE FULL TEXT HERE'  // ← Project Gutenberg からコピーして貼り付ける
}
```

テキストは [Project Gutenberg](https://www.gutenberg.org/) からコピーできます。

---

## Course / 授業情報

- Texas A&M University
- 19th-Century American Literature + Digital Humanities
- 全12回 / 12-week course

---

## License

App code: MIT
Text content: Public domain (Project Gutenberg)
