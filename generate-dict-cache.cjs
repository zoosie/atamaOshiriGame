"use strict";

// NOTICE:一般名詞は判定精度が低いため扱いを中止。よってこのファイルは使わない


// mecab-ipadic-seedから名詞のみ抽出するスクリプト
// ローカルで実行し、結果出来上がったファイルをプログラム内で使用する
// このスクリプトはプログラム内では走ることはない

const fs = require("fs");
const path = require("path");

const DICT_DIR = path.join(
  __dirname,
  "node_modules/mecab-ipadic-seed/lib/dict",
);
const OUTPUT = path.join(__dirname, "src/data/dict-cache.json");

function toHiragana(str) {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

const csvFiles = fs
  .readdirSync(DICT_DIR)
  .filter((f) => f.startsWith("Noun") && f.endsWith(".csv"));
const result = [];

for (const file of csvFiles) {
  const lines = fs.readFileSync(path.join(DICT_DIR, file), "utf-8").split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(",");
    const reading = toHiragana(cols[11] ?? "");
    if (!reading || reading.length <= 2) continue;
    result.push({
      basic_form: cols[0],
      reading,
      pos_detail_1: cols[5],
      pos_detail_2: cols[6],
    });
  }
}

fs.writeFileSync(OUTPUT, JSON.stringify(result));
console.log(`Done: ${result.length} entries → ${OUTPUT}`);
