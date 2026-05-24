import type { ElementType } from "react";
import { Search } from "lucide-react";

type Tool = {
  name: string;
  description: string;
  args_schema?: {
    arg: string;
    type: string;
    required: boolean;
    description: string;
  }[];
};

type Props = {
  mcpTools: Tool[];
  selected: Tool | null;
  setSelected: (t: Tool | null) => void;
  toolIconMap: Record<string, ElementType>;
};

export default function ToolsSection({
  mcpTools,
  selected,
  setSelected,
  toolIconMap,
}: Props) {

  const IconByName = ({ name }: { name: string }) => {
    const Icon = toolIconMap[name] ?? Search;
    return <Icon className="h-4 w-4 text-[var(--color-accent-text)]" />;
  };

  return (
    <section className="card p-6 md:col-span-3 h-[46vh] flex flex-col overflow-hidden">
      <header className="mb-4">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
          AI Librarian 目前有使用的檢索工具（{mcpTools.length}）
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          點擊工具可查看說明
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {mcpTools.map((t) => {
          const Icon = toolIconMap[t.name] ?? Search;
          const active = selected?.name === t.name;

          return (
            <button
              key={t.name}
              onClick={() => setSelected(t)}
              className={`chip transition ${
                active
                  ? "chip-active"
                  : "chip-idle"
              }`}
              title={t.name}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{t.name}</span>
            </button>
          );
        })}
      </div>

      <div className="theme-panel flex-1 overflow-y-auto rounded-xl p-4">
        {!selected ? (
          <p className="text-[var(--color-text-secondary)]">
            請從上方點選一個工具，這裡會顯示描述。
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IconByName name={selected.name} />
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                {selected.name}
              </h3>
            </div>

            <p className="text-[var(--color-text-secondary)]">
              {selected.description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
