interface CheckProps {
  fullWord: string;
  setResult: (value: string) => void;
}
import { CORRECT, DISCORRECT } from "../constractions/const";

/**
 * ユーザーが入力した単語が存在するかチェック
 * @param fullWord - 頭＋ユーザー入力＋お尻を結合したひらがな文字列
 * @param setResult - 正解/不正解の文字列をstateにセットするsetter
 */
async function check({ fullWord, setResult }: CheckProps) {
  const res = await fetch(`/api/check?input=${fullWord}`);
  const data = await res.json();
  const { customValid } = data;
  // 「名詞＋名詞」許容版
  // const isValid =
  //   (tokens.length >= 1 &&
  //   tokens.every(
  //     (t: { word_type: string; pos: string }) =>
  //       t.word_type === "KNOWN" && t.pos === "名詞"
  //   )) || customValid;
  setResult(customValid ? CORRECT : DISCORRECT);
}

export default check;
