import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Mic, Square } from "lucide-react";

type Props = {
  input: string; // 目前輸入的文字
  setInput: Dispatch<SetStateAction<string>>; // 更新輸入內容
  onSend: (customInput?: string) => void;
  loading: boolean; // 是否為處理中（顯示 loading）
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
};

export default function ChatInput({ input, setInput, onSend, loading }: Props) {
  // 用來偵測中文輸入法是否正在組字（避免誤送出）
  const composingRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechBaseRef = useRef("");
  const speechFinalRef = useRef("");
  const stopRequestedRef = useRef(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // 初始化 SpeechRecognition（Chrome/Edge）
  useEffect(() => {
    const SpeechCtor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechCtor) {
      setSpeechSupported(false);
      return;
    }

    const recognition: SpeechRecognitionLike = new SpeechCtor();
    recognition.lang = "zh-TW";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res?.isFinal && res[0]?.transcript) {
          const next = res[0].transcript.trim();
          if (next) {
            speechFinalRef.current = speechFinalRef.current
              ? `${speechFinalRef.current} ${next}`
              : next;
          }
        } else if (res?.[0]?.transcript) {
          interim = res[0].transcript;
        }
      }
      const combined = `${speechFinalRef.current} ${interim}`.trim();
      const base = speechBaseRef.current.trim();
      setInput(combined ? (base ? `${base} ${combined}` : combined) : base);
    };

    recognition.onend = () => {
      if (!stopRequestedRef.current) {
        try {
          recognition.start();
          setListening(true);
          return;
        } catch (_) {}
      }
      setListening(false);
    };
    recognition.onerror = () => {
      if (!stopRequestedRef.current) {
        try {
          recognition.start();
          setListening(true);
          return;
        } catch (_) {}
      }
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.stop?.();
      recognitionRef.current = null;
    };
  }, [setInput]);

  const toggleMic = () => {
    const recognition = recognitionRef.current;
    if (!speechSupported || !recognition) return;

    if (listening) {
      stopRequestedRef.current = true;
      recognition.stop();
      setListening(false);
      return;
    }

    try {
      stopRequestedRef.current = false;
      speechBaseRef.current = input;
      speechFinalRef.current = "";
      recognition.start();
      setListening(true);
    } catch (_) {}
  };

  return (
    <div className="mt-4 flex gap-3">
      {/* 輸入區：支援 Shift+Enter 換行，避免中文輸入 Enter 誤觸 */}
      <textarea
        value={input}

        onChange={(e) => setInput(e.target.value)}

        onCompositionStart={() => (composingRef.current = true)}

        onCompositionEnd={() => (composingRef.current = false)}

        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          if (e.shiftKey) return;

          const isComposing =
            (e as any).nativeEvent?.isComposing ||
            composingRef.current ||
            (e as any).keyCode === 229;

          if (isComposing) return;

          e.preventDefault();
          onSend();
        }}
        placeholder="輸入問題..."
        rows={2}
        className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 resize-none no-underline"
      />

      {/* 語音按鈕：點一下開始、再點一下停止 */}
      <button
        type="button"
        onClick={toggleMic}
        disabled={!speechSupported}
        className={`
          w-16 h-11 rounded-lg
          border border-sky-700/40
          ${listening ? "bg-sky-600/30 text-sky-100" : "bg-sky-500/10 text-sky-200"}
          hover:bg-sky-600/20
          disabled:opacity-40 disabled:cursor-not-allowed
          flex items-center justify-center
        `}
        aria-pressed={listening}
        aria-label={listening ? "停止語音輸入" : "開始語音輸入"}
        title={speechSupported ? (listening ? "停止" : "語音") : "不支援語音輸入"}
      >
        {listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>

      {/* 送出按鈕：處理中時 disabled 並顯示 Spinner */}
      <button

        onClick={() => onSend()}
        disabled={loading}
        className="
          w-28 h-11 rounded-lg
          border border-sky-700/40 
          bg-sky-500/10 text-sky-200 
          hover:bg-sky-600/20
          disabled:opacity-50
          flex items-center justify-center
        "
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <span>處理中</span>
            <div className="w-5 h-5 border-2 border-sky-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          "送出"
        )}
      </button>
    </div>
  );
}
