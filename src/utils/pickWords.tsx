import type { targetWordListProps } from "../App";
import type { topicProps } from "../App";

interface pickTwoCharsProps {
  atama: string;
  oshiri: string;
}

export type WordDict = Map<string, targetWordListProps>;

/**
 * CSVファイルをfetchして辞書Mapを構築する
 */
export async function loadWordDict(topic: topicProps): Promise<WordDict> {
  const dict: WordDict = new Map();
  const csvFiles = [];
  const base = import.meta.env.BASE_URL;
  if (topic.pokemon_name) csvFiles.push(`${base}data/POKEMON_ALL.csv`);
  if (topic.item) csvFiles.push(`${base}data/ITEM_ALL.csv`);
  if (topic.waza) csvFiles.push(`${base}data/WAZA_ALL.csv`);

  for (const file of csvFiles) {
    const res = await fetch(file);
    const text = await res.text();
    const lines = text.split("\n");
    for (let i = 1; i < lines.length; i++) {
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

  console.log(`Word dict loaded: ${dict.size} entries`);
  return dict;
}

/**
 * 頭とお尻を作成
 * @returns Object{ atama: string, oshiri: string }
 */
export function pickTwoChars(): pickTwoCharsProps {
  // 頭：「を」「ん」「ー」除外
  const atamaPool = HIRAGANA_BASE;
  const atama = atamaPool[Math.floor(Math.random() * atamaPool.length)];

  // お尻：「ん」「ー」OK、ただし文字1と異なる文字
  const oshiriPool = HIRAGANA_WITH_N.filter((c) => c !== atama);
  const oshiri = oshiriPool[Math.floor(Math.random() * oshiriPool.length)];

  return { atama: atama, oshiri: oshiri };
}

/**
 * 作成した頭で始まりお尻で終わる名詞を全件取得
 * @param atama - 単語の先頭1文字（ひらがな）
 * @param oshiri - 単語の末尾1文字（ひらがな）
 * @param dict - 辞書Map
 * @param setTargetWordList - 取得した単語一覧をstateにセットするsetter
 * @returns 頭で始まりお尻で終わる単語の一覧
 */
export async function pickWords(
  atama: string,
  oshiri: string,
  dict: WordDict,
  setTargetWordList: (value: targetWordListProps[]) => void,
): Promise<targetWordListProps[]> {
  if (!atama) return [];
  const allWords: targetWordListProps[] = [];
  dict.forEach((v) => v.reading.startsWith(atama) && allWords.push(v));
  const matched = allWords.filter(
    (v: { reading: string }) => v.reading.slice(-1) === oshiri,
  );
  console.log(matched);
  setTargetWordList(matched);
  return matched;
}

/**
 * カタカナをひらがなに変換
 */
function toHiragana(str: string) {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

const HIRAGANA_BASE = [
  "あ", "い", "う", "え", "お",
  "か", "き", "く", "け", "こ",
  "さ", "し", "す", "せ", "そ",
  "た", "ち", "つ", "て", "と",
  "な", "に", "ぬ", "ね", "の",
  "は", "ひ", "ふ", "へ", "ほ",
  "ま", "み", "む", "め", "も",
  "や", "ゆ", "よ",
  "ら", "り", "る", "れ", "ろ",
  "わ",
];

const HIRAGANA_WITH_N = [...HIRAGANA_BASE, "ん", "ー"];
