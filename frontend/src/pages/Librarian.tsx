import type { ElementType } from "react";
import { useState, useEffect } from "react";

import { mcpTools, type Tool } from "../data/mcpTools";
import {
  Clock,
  FlaskConical,
  Search,
  SquarePlay,
  BookOpen,
  Globe,
  Bookmark,
  CloudSun,
  Settings,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Square,
  SlidersHorizontal,
} from "lucide-react";

import Live2DArea from "../components/Live2DArea";
import ToolsSection from "../components/ToolsSection";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import ConfigModal from "../components/ConfigModal";
import Popover from "../components/Popover";

// LLM streaming hook（負責聊天／工具呼叫／情緒回傳）
import useLLMStream from "../hooks/useLLMStream";

const toolIconMap: Record<string, ElementType> = {
  date_time: Clock,
  arxiv: FlaskConical,
  duckduckgo_results_json: Search,
  youtube_search: SquarePlay,
  ncl_search: BookOpen,
  wikipedia: Globe,
  google_search: Search,
  google_books: Bookmark,
  open_weather_map: CloudSun,
};

const availableModels = [
  "openai:gpt-4o-mini",
  "openai:gpt-4o",
  "openai:o4-mini",
  "openai:gpt-4.1",
  "openai:gpt-4.1-mini",
  "openai:gpt-4.1-nano",
  "openai:o3-mini",
  "openai:o1",
];

const defaultModel = "openai:gpt-4o-mini";

const chatModes = [
  {
    id: "general",
    label: "一般問答",
    description: "一般問題、搜尋與推薦。",
  },
  {
    id: "book-guide",
    label: "書籍介紹",
    description: "以書籍資料整理重點與閱讀方向。",
  },
] as const;

const bookOutputModes = [
  {
    id: "text",
    label: "文字介紹",
  },
  {
    id: "story",
    label: "語音說故事",
  },
] as const;

const generalPrompts = [
  "請幫我查詢今天台北的天氣及日期",
  "我今天心情不好可以給我幾首舒壓音樂嗎？",
];

const storySettings = {
  tone: ["溫柔", "穩重", "活潑"],
  pace: ["慢", "中", "快"],
};

const bookGuidePrompt =
  "目前模式是「書籍介紹」。請針對使用者提到的書籍或主題整理回覆，並使用以下欄位：書名、作者、主題、摘要。若無法確認書名或作者，請明確說明需要使用者補充或標示為未提供，不要捏造。";

const storyPaceRate: Record<string, number> = {
  慢: 0.82,
  中: 1,
  快: 1.18,
};

const storyTonePitch: Record<string, number> = {
  溫柔: 0.92,
  穩重: 0.86,
  活潑: 1.12,
};

export default function Librarian() {
  const [modelUrl, setModelUrl] = useState<string>("");
  const [emotionToken, setEmotionToken] = useState<string | null>(null);

  const [selected, setSelected] = useState<Tool | null>(null);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [currentModel, setCurrentModel] = useState(defaultModel);
  const [chatMode, setChatMode] =
    useState<(typeof chatModes)[number]["id"]>("general");
  const [bookOutputMode, setBookOutputMode] =
    useState<(typeof bookOutputModes)[number]["id"]>("text");
  const [storyTone, setStoryTone] = useState(storySettings.tone[0]);
  const [storyPace, setStoryPace] = useState(storySettings.pace[1]);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] =
    useState<"idle" | "playing" | "paused">("idle");

  const applySettings = () => {
    const t = Math.min(1, Math.max(0, Number(temperature) || 0));
    const m = Math.max(1, Math.floor(Number(maxTokens) || 1));

    setTemperature(t);
    setMaxTokens(m);

    localStorage.setItem(
      "aiConfig",
      JSON.stringify({
        systemPrompt,
        temperature: t,
        maxTokens: m,
        model: currentModel,
      }),
    );

    alert("設定已保存並套用");
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aiConfig");
      if (!raw) return;
      const saved = JSON.parse(raw);

      if (typeof saved.systemPrompt === "string")
        setSystemPrompt(saved.systemPrompt);
      if (typeof saved.temperature === "number")
        setTemperature(saved.temperature);
      if (typeof saved.maxTokens === "number") setMaxTokens(saved.maxTokens);
      if (typeof saved.model === "string") setCurrentModel(saved.model);
    } catch (_) {
      // 忽略錯誤，不讓 UI 中斷
    }
  }, []);

  const modeSystemPrompt =
    chatMode === "book-guide"
      ? [systemPrompt, bookGuidePrompt].filter(Boolean).join("\n\n")
      : systemPrompt;

  const { messages, followUpQuestions, input, setInput, loading, handleSend } =
    useLLMStream({
      systemPrompt: modeSystemPrompt,
      temperature,
      maxTokens,
      currentModel,

      onEmotion: (emo) => setEmotionToken(emo), // Model 回傳角色情緒
    });

  const suggestedQuestions = chatMode === "general" ? generalPrompts : [];
  const inputPlaceholder =
    chatMode === "book-guide" && bookOutputMode === "story"
      ? "輸入書名，或請我用說故事方式介紹一本書..."
      : chatMode === "book-guide"
        ? "輸入書名或主題，我會整理成書籍介紹..."
        : "輸入問題...";
  const latestAssistantIndex = messages.reduce(
    (latestIndex, message, index) =>
      message.role === "assistant" ? index : latestIndex,
    -1,
  );
  const latestAssistantMessage =
    latestAssistantIndex >= 0 ? messages[latestAssistantIndex] : null;
  const canShowVoiceControls =
    chatMode === "book-guide" &&
    bookOutputMode === "story" &&
    !loading &&
    latestAssistantMessage !== null;

  const playVoice = () => {
    const text = latestAssistantMessage?.content.trim();
    if (!text || !("speechSynthesis" in window)) return;

    if (window.speechSynthesis.paused && voiceStatus === "paused") {
      window.speechSynthesis.resume();
      setVoiceStatus("playing");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW";
    utterance.rate = storyPaceRate[storyPace] ?? 1;
    utterance.pitch = storyTonePitch[storyTone] ?? 1;
    utterance.onend = () => setVoiceStatus("idle");
    utterance.onerror = () => setVoiceStatus("idle");

    window.speechSynthesis.speak(utterance);
    setVoiceStatus("playing");
  };

  const pauseVoice = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setVoiceStatus("paused");
  };

  const stopVoice = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setVoiceStatus("idle");
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    stopVoice();
  }, [bookOutputMode, chatMode]);

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-screen-2xl grid-cols-1 gap-6 px-6 overflow-hidden md:grid-cols-3">
      {!isChatExpanded && (
        <Live2DArea
          modelUrl={modelUrl}
          setModelUrl={setModelUrl}
          emotionToken={emotionToken}
        />
      )}

      <section
        className={`card motion-surface flex flex-col p-6 ${
          isChatExpanded
            ? "h-[calc(100vh-8rem)] md:col-span-3"
            : "h-[80vh] md:col-span-2"
        }`}
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              對話區
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              輸入問題 → AI Librarian 回答 → 顯示對話
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Popover
              content={
                <div>
                  <p className="mb-1 font-semibold text-[var(--color-text-primary)]">
                    {isChatExpanded ? "還原對話區" : "放大對話區"}
                  </p>
                  <p>
                    {isChatExpanded
                      ? "回到一般版面，顯示角色與工具列表。"
                      : "讓對話區吃滿畫面，方便閱讀較長回覆。"}
                  </p>
                </div>
              }
            >
              <button
                type="button"
                onClick={() => setIsChatExpanded((current) => !current)}
                className="theme-icon-button rounded-lg p-2"
                aria-label={isChatExpanded ? "還原對話區" : "放大對話區"}
              >
                {isChatExpanded ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>
            </Popover>

            <Popover
              content={
                <div>
                  <p className="mb-1 font-semibold text-[var(--color-text-primary)]">
                    模型設定
                  </p>
                  <p>可以調整模型、溫度、max tokens、system prompt。</p>
                </div>
              }
            >
              <button
                onClick={() => setIsConfigOpen(true)}
                className="theme-icon-button rounded-lg p-2"
              >
                <Settings className="w-5 h-5" />
              </button>
            </Popover>
          </div>
        </header>

        <div className="mb-3 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {chatModes.map((mode) => {
            const active = chatMode === mode.id;

            return (
              <Popover
                key={mode.id}
                className="w-full"
                content={
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    {mode.description}
                  </div>
                }
              >
                <button
                  type="button"
                  onClick={() => setChatMode(mode.id)}
                  className={`flex w-full items-center justify-center rounded-xl border px-4 py-1.5 text-center transition hover:text-[var(--color-text-primary)] ${
                    active
                      ? "border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]"
                      : "border-[var(--color-border)] bg-[var(--color-bg-panel)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  <div className="text-sm font-semibold sm:text-base">
                    {mode.label}
                  </div>
                </button>
              </Popover>
            );
          })}
        </div>

        {chatMode === "book-guide" && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {bookOutputModes.map((mode) => {
              const active = bookOutputMode === mode.id;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setBookOutputMode(mode.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition hover:text-[var(--color-text-primary)] ${
                    active
                      ? "theme-button-accent theme-button-accent-active"
                      : "theme-button-secondary"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}

            {bookOutputMode === "story" && (
              <Popover
                content={
                  <div>
                    <p className="mb-1 font-semibold text-[var(--color-text-primary)]">
                      語音輸出設定
                    </p>
                    <p>
                      目前：{storyTone}語氣，{storyPace}速
                    </p>
                  </div>
                }
              >
                <button
                  type="button"
                  onClick={() => setIsVoiceSettingsOpen(true)}
                  className="theme-icon-button rounded-full p-2"
                  aria-label="開啟語音輸出設定"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </Popover>
            )}
          </div>
        )}

        {isConfigOpen && (
          <ConfigModal
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
            temperature={temperature}
            setTemperature={setTemperature}
            maxTokens={maxTokens}
            setMaxTokens={setMaxTokens}
            currentModel={currentModel}
            setCurrentModel={setCurrentModel}
            availableModels={availableModels}
            onClose={() => setIsConfigOpen(false)}
            onApply={() => {
              applySettings();
              setIsConfigOpen(false);
            }}
          />
        )}

        {isVoiceSettingsOpen && (
          <VoiceSettingsModal
            tone={storyTone}
            pace={storyPace}
            onToneChange={setStoryTone}
            onPaceChange={setStoryPace}
            onClose={() => setIsVoiceSettingsOpen(false)}
          />
        )}

        {messages.length === 0 && suggestedQuestions.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="theme-button-accent motion-button rounded-lg px-3 py-1 text-sm"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <MessageList
          messages={messages}
          followUpQuestions={followUpQuestions}
          onFollowUpClick={(q) => handleSend(q)}
          assistantActions={
            canShowVoiceControls
              ? {
                  messageIndex: latestAssistantIndex,
                  controls: (
                    <div className="flex shrink-0 gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-panel)] p-1">
                      <button
                        type="button"
                        onClick={playVoice}
                        className="theme-icon-button rounded-full p-1.5"
                        aria-label={
                          voiceStatus === "paused" ? "繼續播放" : "播放語音"
                        }
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={pauseVoice}
                        disabled={voiceStatus !== "playing"}
                        className="theme-icon-button rounded-full p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="暫停語音"
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={stopVoice}
                        disabled={voiceStatus === "idle"}
                        className="theme-icon-button rounded-full p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="停止語音"
                      >
                        <Square className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ),
                }
              : undefined
          }
        />

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={(msg) => handleSend(msg)}
          loading={loading}
          placeholder={inputPlaceholder}
        />
      </section>

      {/* 下方工具列表區域 */}
      {!isChatExpanded && (
        <ToolsSection
          mcpTools={mcpTools}
          selected={selected}
          setSelected={setSelected}
          toolIconMap={toolIconMap}
        />
      )}
    </div>
  );
}

function VoiceSettingsModal({
  tone,
  pace,
  onToneChange,
  onPaceChange,
  onClose,
}: {
  tone: string;
  pace: string;
  onToneChange: (value: string) => void;
  onPaceChange: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="theme-overlay fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="theme-modal w-full max-w-md rounded-xl p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-[var(--color-accent-text)]" />
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
            語音輸出設定
          </h3>
        </div>

        <div className="space-y-5">
          <StorySettingRow
            label="故事語氣"
            options={storySettings.tone}
            selected={tone}
            onSelect={onToneChange}
          />
          <StorySettingRow
            label="語速"
            options={storySettings.pace}
            selected={pace}
            onSelect={onPaceChange}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="theme-button-primary rounded-lg px-4 py-2"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

function StorySettingRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-full px-4 py-2 text-sm ${
              option === selected
                ? "theme-button-accent theme-button-accent-active"
                : "theme-button-secondary"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
