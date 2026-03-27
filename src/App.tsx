import { useEffect, useRef, useState } from "react";
import "./App.css";
import check from "./utils/check";
import { loadWordDict, pickTwoChars, pickWords } from "./utils/pickWords";
import type { WordDict } from "./utils/pickWords";
import { CORRECT } from "./constractions/const";

export interface targetWordListProps {
  basic_form: string;
  pos_detail_1: string;
  pos_detail_2: string;
  reading: string;
}

function App() {
  const [dict, setDict] = useState<WordDict | null>(null);
  const [targetWordList, setTargetWordList] = useState<targetWordListProps[]>(
    [],
  );
  const [atamaText, setAtamaText] = useState<string>("頭");
  const [oshiriText, setOshiriText] = useState<string>("お尻");
  const [fullWord, setFullWord] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const isComposing = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 起動時に辞書をロード
  useEffect(() => {
    loadWordDict().then(setDict);
  }, []);

  function reset() {
    setAtamaText("");
    setOshiriText("");
    setFullWord("");
    setResult(null);
    setTargetWordList([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  // 今回のお題ワードを1件ピックアップ
  async function pickWord() {
    if (!dict) return;
    const { atama, oshiri } = pickTwoChars();
    setAtamaText(atama);
    setOshiriText(oshiri);
    const matched = await pickWords(atama, oshiri, dict, setTargetWordList);
    if (matched.length === 0) {
      // 頭+お尻の組み合わせワードが存在しなければ再施行
      await pickWord();
    }
  }

  function filterHiragana(raw: string): string {
    return raw
      .split("")
      .filter((ch) => ch.match(/^[\u3040-\u309f\u30fc]$/))
      .join("");
  }

  /**
   * 回答の属性を表示
   */
  function matched() {
    const matched = targetWordList.filter((v) => v.reading === fullWord)[0];
    if (!matched) return <></>;
    return (
      <p style={{ color: "blue", fontWeight: "bold" }}>
        【{matched.basic_form}】：{matched.pos_detail_2}
      </p>
    );
  }
  /**
   * 回答後の結果表示
   * @param result - 正解/不正解の文字列。nullの場合は何も表示しない
   * @param targetWordList - 正解単語の一覧
   * @returns 結果表示用のJSX。resultがnullの場合はundefined
   */
  function showResult(
    result: string | null,
    targetWordList: targetWordListProps[],
  ) {
    if (result === null) return <></>;

    const isCorrect = result === CORRECT;
    const correctAnswers = targetWordList.map(
      (v, i) =>
        v.reading !== fullWord && (
          <p key={i} style={{ color: "blue", fontWeight: "bold" }}>
            【{v.basic_form}】：{v.pos_detail_2}
          </p>
        ),
    );

    return (
      <>
        {isCorrect ? (
          matched()
        ) : (
          <p style={{ color: "red", fontWeight: "bold" }}>{fullWord}</p>
        )}
        <p>{result}</p>
        {isCorrect ? (
          // 正解の場合
          targetWordList.length > 1 ? (
            <>
              <p>正解は他に</p>
              {correctAnswers}
            </>
          ) : (
            <p>正解はこれだけ！</p>
          )
        ) : (
          // 不正解の場合
          <>
            <p>正解は</p>
            {correctAnswers}
          </>
        )}
      </>
    );
  }

  return (
    <>
      <section id="center">
        <button
          onClick={() => {
            reset();
            pickWord();
          }}
          disabled={!dict}
        >
          {dict ? "はじめる" : "読み込み中..."}
        </button>
        <div style={{ display: "flex" }}>
          <p>{atamaText}</p>
          <input
            type="text"
            ref={inputRef}
            onCompositionStart={() => {
              isComposing.current = true;
            }}
            onCompositionEnd={(e) => {
              isComposing.current = false;
              const filtered = filterHiragana(e.currentTarget.value);
              e.currentTarget.value = filtered; // 漢字を除去してひらがなのみ表示
              if (filtered !== "" && dict) {
                const fullWordString = atamaText + filtered + oshiriText;
                setFullWord(fullWordString);
                check({
                  fullWord: fullWordString,
                  dict,
                  setResult,
                });
              }
            }}
            onChange={(e) => {
              if (isComposing.current) return;
              // IMEなしの直接入力（ひらがな以外は除去）
              const filtered = filterHiragana(e.currentTarget.value);
              e.currentTarget.value = filtered;
            }}
          />
          <p>{oshiriText}</p>
        </div>
        {showResult(result, targetWordList)}
      </section>
    </>
  );
}

export default App;
