import { useState, useRef } from "react";

type Message = { role: "user" | "assistant"; content: string };

type APIMessage = { role: "system" | "user" | "assistant"; content: string };

type APIConfig = {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  currentModel: string;
  onEmotion?: (emotion: string) => void; // 將情緒token加入型別
};

export default function useLLMStream({
  systemPrompt,
  temperature,
  maxTokens,
  currentModel,
  onEmotion,
}: APIConfig) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

  const llmBufferRef = useRef<string>("");

  const appendToAssistantMessage = (delta: string) => {
    if (!delta) return;
    setMessages((prev) => {
      if (prev.length === 0) return prev;

      const updated = [...prev];
      const lastIndex = updated.length - 1;
      const lastMessage = updated[lastIndex];
      if (!lastMessage || lastMessage.role !== "assistant") return prev;

      updated[lastIndex] = {
        ...lastMessage,
        content: lastMessage.content + delta,
      };
      return updated;
    });
  };

  // async/await + Promise：向後端請求延伸問題
  const requestFollowUps = async (answer: string) => {
    try {

      const res = await fetch("http://localhost:8000/v2/react/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "你是一個助手。只允許輸出 JSON 陣列，不要其他文字。",
            },
            {
              role: "user",
              content:
                '請根據以下回答生成三個延伸追問問題，輸出格式必須是 JSON 陣列。例如:["問題1","問題2","問題3"]。\n\n回答內容: ' +
                answer,
            },
          ],
          llm_config: {
            model: currentModel,
            temperature,
            max_tokens: 128,
          },
          thread_id: "thread-suggestions",
        }),
      });

      const json = await res.json();
      const text = json?.messages?.[0]?.content ?? "";
      setFollowUpQuestions(parseSuggestions(text));
    } catch (err) {
      console.error("延伸問題錯誤：", err);
    }
  };

  // function 宣告：解析延伸問題
  function parseSuggestions(text: string): string[] {
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) return arr;
    } catch (_) {}

    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const arr = JSON.parse(match[0]);
        if (Array.isArray(arr)) return arr;
      } catch (_) {}
    }

    // split + map + filter：寬鬆解析（map/filter 語法）
    return text
      .split(/\n|,|。/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  // async/await：送出訊息並接收 SSE
  const handleSend = async (customInput?: string) => {
    const text = customInput ?? input;
    if (!text.trim()) return;

    // 先插入使用者訊息
    const userMsg: Message = { role: "user", content: text };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setFollowUpQuestions([]);

    // 組 API messages
    const messagesForAPI: APIMessage[] = [
      { role: "system", content: systemPrompt },

      ...messages.map(
        (m) => ({ role: m.role, content: m.content } as APIMessage)
      ),
      userMsg,
    ];

    try {
      llmBufferRef.current = "";

      // 開 SSE 請求

      const response = await fetch("http://localhost:8000/v2/react/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForAPI,
          llm_config: {
            model: currentModel,
            temperature,
            max_tokens: maxTokens,
          },
          thread_id: "thread-frontend",
        }),
      });

      if (!response.body) throw new Error("後端沒有 body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        // for...of：逐段解析 SSE 區塊
        for (const part of parts) {
          if (!part.trim()) continue;

          const lines = part.split("\n");
          // find（callback 為箭頭函式）
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;

          const eventType = eventLine
            .replace("event:", "")
            .trim()
            .toLowerCase();
          const data = JSON.parse(dataLine.replace("data:", "").trim());

          // 處理不同事件
          switch (eventType) {
            case "tool_chosen":
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: `使用工具：${data.used_tools.name}`,
                },
              ]);
              break;

            case "tool_output":
              console.log("🔧 工具輸出：", data);
              break;

            case "emotion":

              if (onEmotion && data.emotion) {
                onEmotion(data.emotion);
              }
              break;

            case "llm_start":
              {

                const chunk =
                  typeof data.message_chunk === "string"
                    ? data.message_chunk
                    : "";
                llmBufferRef.current = chunk;

                setMessages((prev) => [
                  ...prev,
                  { role: "assistant", content: chunk },
                ]);
              }
              break;

            case "llm_delta":
              {

                const chunk =
                  typeof data.message_chunk === "string"
                    ? data.message_chunk
                    : "";
                llmBufferRef.current += chunk;
                appendToAssistantMessage(chunk);
              }
              break;

            case "llm_end":
              {

                const chunk =
                  typeof data.message_chunk === "string"
                    ? data.message_chunk
                    : "";
                if (chunk) {
                  llmBufferRef.current += chunk;
                  appendToAssistantMessage(chunk);
                }

                requestFollowUps(llmBufferRef.current);
                setLoading(false);
              }
              break;

            default:
              console.warn("未知事件：", eventType, data);
          }
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("handleSend 錯誤：", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "系統錯誤，請稍後再試" },
      ]);
      setLoading(false);
    }
  };

  return {
    messages,
    followUpQuestions,
    input,
    setInput,
    loading,
    handleSend,
  };
}
