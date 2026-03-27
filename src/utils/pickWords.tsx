import type { targetWordListProps } from "../App";
interface pickTwoCharsProps {
  atama: string;
  oshiri: string;
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
 * @param setTargetWordList - 取得した単語一覧をstateにセットするsetter
 * @returns 頭で始まりお尻で終わる単語の一覧
 */
export async function pickWords(
  atama: string,
  oshiri: string,
  setTargetWordList: (value: targetWordListProps[]) => void,
): Promise<targetWordListProps[]> {
  const res = await fetch(`/api/pick_words?atama=${atama}`);
  const allWords = await res.json();
  const matched = allWords.wordList.filter(
    (v: { reading: string }) => v.reading.slice(-1) === oshiri,
  );
  console.log(matched);
  setTargetWordList(matched);
  return matched;
}

const HIRAGANA_BASE = [
  "あ",
  "い",
  "う",
  "え",
  "お",
  "か",
  "き",
  "く",
  "け",
  "こ",
  "さ",
  "し",
  "す",
  "せ",
  "そ",
  "た",
  "ち",
  "つ",
  "て",
  "と",
  "な",
  "に",
  "ぬ",
  "ね",
  "の",
  "は",
  "ひ",
  "ふ",
  "へ",
  "ほ",
  "ま",
  "み",
  "む",
  "め",
  "も",
  "や",
  "ゆ",
  "よ",
  "ら",
  "り",
  "る",
  "れ",
  "ろ",
  "わ",
];

const HIRAGANA_WITH_N = [...HIRAGANA_BASE, "ん", "ー"];
