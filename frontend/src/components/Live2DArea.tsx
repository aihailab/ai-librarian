import { useCallback, useEffect, useState } from "react";
import Live2DPanel from "./Live2DPanel";

type Live2DInfo = {
  name: string;
  url: string;
  tags?: string[];
};

type Props = {
  modelUrl: string;
  setModelUrl: (url: string) => void;
  emotionToken: string | null;
};

export default function Live2DArea({
  modelUrl,
  setModelUrl,
  emotionToken,
}: Props) {
  const [_models, _setModels] = useState<Live2DInfo[]>([]);
  const [resizeKey, setResizeKey] = useState(0);

  const rebuildPanel = useCallback(() => {
    setResizeKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let timer: any = null;

    const handle = () => {
      if (timer) clearTimeout(timer);

      timer = setTimeout(() => {
        rebuildPanel();
      }, 200);
    };

    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [rebuildPanel]);

  useEffect(() => {
    const handleFontSizeChange = () => rebuildPanel();
    window.addEventListener("font-size-change", handleFontSizeChange);
    return () =>
      window.removeEventListener("font-size-change", handleFontSizeChange);
  }, [rebuildPanel]);

  useEffect(() => {
    const manifestPath = "/index.json";

    fetch(manifestPath)
      .then((res) => {
        if (!res.ok) throw new Error(`Manifest ${manifestPath} ${res.status}`);
        return res.json();
      })
      .then((list: Live2DInfo[]) => {

        const normalized = list.map((m) => {
          const name = m.name.trim();
          const good =
            m.url && m.url.startsWith("/") && m.url.endsWith(".model3.json")
              ? m.url
              : `/${name}/${name}.model3.json`;
          return { ...m, url: good };
        });

        _setModels(normalized);

        const first = normalized.find((m) => m.url.endsWith(".model3.json"));
        setModelUrl(first?.url ?? normalized[0]?.url ?? "");
      })
      .catch((err) => {
        console.error("Load Live2D manifest failed:", err);
        _setModels([]);
      });
  }, [setModelUrl]);

  return (
    <section className="card p-6 md:col-span-1 h-[80vh] relative">
      <div className="absolute inset-0 rounded-xl border border-dashed border-sky-700/40 bg-neutral-900/40 z-0">
        {modelUrl && (
          <Live2DPanel
            key={`${modelUrl}-${resizeKey}`}
            modelUrl={modelUrl}
            className="w-full h-full"
            emotionToken={emotionToken ?? undefined}
          />
        )}
      </div>

      <div className="absolute top-2 right-2 z-10">
        <select
          value={modelUrl}
          onChange={(e) => setModelUrl(e.target.value)}
          className="rounded-md border border-sky-700/40 bg-neutral-900/80 px-2 py-1 text-[11px] text-neutral-200"
        >
          {_models.map((m) => (
            <option key={m.url} value={m.url} className="bg-neutral-900">
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="absolute bottom-2 right-2 z-10">
        <div className="flex items-center gap-2 rounded-md border border-sky-700/40 bg-neutral-900/70 px-2 py-1 text-[10px] text-neutral-200 backdrop-blur">
          <span className="text-neutral-400">emotion</span>
          <span className="font-mono text-sky-300">
            {emotionToken ? emotionToken : "-"}
          </span>
        </div>
      </div>
    </section>
  );
}
