type ConfigModalProps = {
  systemPrompt: string;
  setSystemPrompt: (value: string) => void;
  temperature: number;
  setTemperature: (value: number) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  currentModel: string;
  setCurrentModel: (value: string) => void;
  availableModels: string[];

  onClose: () => void;
  onApply: () => void;
};

export default function ConfigModal({
  systemPrompt,
  setSystemPrompt,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,

  currentModel,
  setCurrentModel,
  availableModels,

  onClose,
  onApply,
}: ConfigModalProps) {
  return (
    <div className="theme-overlay fixed inset-0 z-50 flex items-center justify-center">
      <div className="theme-modal w-full max-w-md rounded-xl p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-[var(--color-text-primary)]">
          模型設定
        </h3>

        <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">
          選擇模型
        </label>
        <select
          value={currentModel}
          onChange={(e) => setCurrentModel(e.target.value)}
          className="theme-input mb-4 w-full rounded-lg px-3 py-2"
        >
          {availableModels.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">
          System Prompt
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={3}
          className="theme-input mb-4 w-full resize-none rounded-lg px-3 py-2"
        />

        <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">
          Temperature{" "}
          <span className="text-[var(--color-text-muted)]">
            (數值越高，回答越有創意)
          </span>
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="1"
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="theme-input mb-4 w-full rounded-lg px-3 py-2"
        />

        <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">
          Max Tokens{" "}
          <span className="text-[var(--color-text-muted)]">
            (限制回答長度)
          </span>
        </label>
        <input
          type="number"
          value={maxTokens}
          onChange={(e) => setMaxTokens(Number(e.target.value))}
          className="theme-input mb-6 w-full rounded-lg px-3 py-2"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="theme-button-secondary rounded-lg px-4 py-2"
          >
            取消
          </button>
          <button
            onClick={onApply}
            className="theme-button-primary rounded-lg px-4 py-2"
          >
            儲存並套用
          </button>
        </div>
      </div>
    </div>
  );
}
