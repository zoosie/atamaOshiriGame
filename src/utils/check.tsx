import { CORRECT, DISCORRECT } from "../constractions/const";
import type { WordDict } from "./pickWords";

interface CheckProps {
  fullWord: string;
  dict: WordDict;
  setResult: (value: string) => void;
}

/**
 * ユーザーが入力した単語が存在するかチェック
 * @param fullWord - 頭＋ユーザー入力＋お尻を結合したひらがな文字列
 * @param dict - 辞書Map
 * @param setResult - 正解/不正解の文字列をstateにセットするsetter
 */
function check({ fullWord, dict, setResult }: CheckProps) {
  const customValid = dict.has(fullWord);
  setResult(customValid ? CORRECT : DISCORRECT);
}

export default check;
