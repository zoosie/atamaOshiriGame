const express = require("express");
const fs = require("fs");
const path = require("path");

// 一般名詞＋カスタムCSVの内容全件
const wordDict = loadWordDict();

const app = express();
app.listen(3001, () => console.log("Server running on http://localhost:3001"));

/**
 * あたまで始まる単語をピックアップ
 * @param {string} req.query.atama - 絞り込むひらがな1文字
 * @returns {{ wordList: Array<{basic_form: string, reading: string, pos_detail_1: string, pos_detail_2: string}> }}
 */
app.get("/api/pick_words", (req, res) => {
  const atama = req.query.atama;
  if (!atama) return res.json({ wordList: [] });
  const wordList = [];
  wordDict.forEach((v) => {
    v.reading.startsWith(atama) && wordList.push(v);
  });
  res.json({ wordList });
});

/**
 * 頭＋インプット＋お尻が名詞一覧に存在するか
 * @param {string} req.query.input - ユーザーが入力した頭＋インプット＋お尻のひらがな文字列
 * @returns {{ customValid: boolean }}
 */
app.get("/api/check", (req, res) => {
  const fullWord = req.query.input;
  if (!fullWord) return res.json({ result: false });
  const customValid = wordDict.has(fullWord);
  res.json({ customValid });
});

/**
 * 一般名詞＋カスタムCSVの内容全件をMap<reading(ひらがな), エントリ>で返す
 * { basic_form, reading, pos_detail_1, pos_detail_2 }
 * @returns {Map<string, {basic_form: string, reading: string, pos_detail_1: string, pos_detail_2: string}>}
 */
function loadWordDict() {
  const dict = new Map();

  // *** 一般名詞は精度が低いため中止。 ***
  // // dict-cache.json（mecab-ipadic 名詞）を追加
  // const cacheFile = path.join(__dirname, "src/data/dict-cache.json");
  // if (fs.existsSync(cacheFile)) {
  //   const entries = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
  //   for (const entry of entries) {
  //     if (entry.reading) dict.set(entry.reading, entry);
  //   }
  // }

  // カスタムCSV（ポケモン用語）を追加
  // TODO：辞書にポケモン人名＋ポケモン技＋ポケモン地名追加
  const dataDir = path.join(__dirname, "src/data");
  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".csv"));
    for (const file of files) {
      const lines = fs
        .readFileSync(path.join(dataDir, file), "utf-8")
        .split("\n");
      for (let i = 1; i < lines.length; i++) {
        // 1行目はヘッダーなのでスキップ
        const cols = lines[i].split(",");
        if (!cols[0]?.trim()) continue;
        const reading = toHiragana(cols[0].trim());
        dict.set(reading, {
          basic_form: cols[0].trim(),
          reading,
          pos_detail_1: cols[2]?.trim() ?? "*",
          pos_detail_2: cols[3]?.trim() ?? "*",
        });
      }
    }
  }

  console.log(`Word dict loaded: ${dict.size} entries`);
  return dict;
}

/**
 * カタカナをひらがなに変換
 * @param {string} str - 変換対象の文字列（カタカナ混じり可）
 * @returns {string} カタカナをひらがなに変換した文字列
 */
function toHiragana(str) {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}
