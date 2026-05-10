import { useMemo, useState } from "react";
import {
  BookImage,
  FileImage,
  Film,
  Images,
  LayoutTemplate,
  Sparkles,
  Upload,
  Volume2,
} from "lucide-react";

type ProjectStep = {
  id: string;
  label: string;
  status: "done" | "active" | "pending";
};

type PageDraft = {
  title: string;
  body: string;
};

const steps: ProjectStep[] = [
  { id: "source", label: "素材", status: "done" },
  { id: "outline", label: "大綱", status: "done" },
  { id: "pagination", label: "分頁", status: "active" },
  { id: "art", label: "圖文", status: "pending" },
  { id: "export", label: "匯出", status: "pending" },
];

const draftPages: PageDraft[] = [
  {
    title: "第 1 頁｜晨光下的回憶",
    body: "阿春阿嬤坐在窗邊，陽光落在她最喜歡的花布椅上。她摸著舊照片，想起年輕時帶孩子去市場的清晨。",
  },
  {
    title: "第 2 頁｜市場的香味",
    body: "她記得熱豆漿的香氣，還有菜販熱情的招呼聲。那些日常片刻，像一首慢慢唱的歌，陪她走過很多年。",
  },
  {
    title: "第 3 頁｜把故事說給今天的自己聽",
    body: "阿嬤對著窗外微笑，決定把這些記憶整理成一本小繪本，留給自己，也留給家人一起翻閱。",
  },
];

const audienceOptions = ["熟齡讀者", "失智陪伴", "親子共讀"];
const styleOptions = ["溫暖懷舊", "生活寫實", "療癒童話"];
const pageCountOptions = ["5 頁", "8 頁", "10 頁"];

export default function PictureBook() {
  const [selectedPage, setSelectedPage] = useState(1);
  const [audience, setAudience] = useState(audienceOptions[0]);
  const [style, setStyle] = useState(styleOptions[0]);
  const [pageCount, setPageCount] = useState(pageCountOptions[1]);

  const activeDraft = useMemo(
    () => draftPages[selectedPage - 1] ?? draftPages[0],
    [selectedPage]
  );

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="chip w-fit">
              <BookImage className="h-4 w-4" />
              熟齡繪本工作台
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                把照片、描述與回憶變成一本可陪讀的故事繪本
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
                第一版先以簡報型繪本為核心，支援故事大綱、分頁草稿、每頁圖文預覽與匯出流程。影片匯出先保留在工作台右欄。
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-panel)] p-4 text-sm text-[var(--color-text-secondary)] sm:grid-cols-3">
            <div>
              <div className="font-semibold text-[var(--color-text-primary)]">
                目標讀者
              </div>
              <div>{audience}</div>
            </div>
            <div>
              <div className="font-semibold text-[var(--color-text-primary)]">
                繪本風格
              </div>
              <div>{style}</div>
            </div>
            <div>
              <div className="font-semibold text-[var(--color-text-primary)]">
                預計頁數
              </div>
              <div>{pageCount}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                step.status === "done"
                  ? "border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]"
                  : step.status === "active"
                    ? "border-[var(--color-accent-strong)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-panel)] text-[var(--color-text-secondary)]"
              }`}
            >
              <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                Step
              </div>
              <div className="mt-1 font-semibold">{step.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)_320px]">
        <aside className="card space-y-5 p-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              素材與設定
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              先決定故事主題，再補充照片、描述與對象設定。
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[var(--color-text-primary)]">
              繪本主題
            </label>
            <textarea
              rows={4}
              defaultValue="把阿嬤年輕時去市場工作的回憶，整理成一本溫暖又平靜的陪伴繪本。"
              className="theme-input w-full resize-none rounded-2xl px-4 py-3 text-sm leading-6"
            />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">
              上傳素材
            </div>
            <button className="theme-button-accent flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm">
              <Upload className="h-4 w-4" />
              上傳圖片或生活照
            </button>
            <button className="theme-button-secondary flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm">
              <FileImage className="h-4 w-4" />
              補充描述與人物設定
            </button>
          </div>

          <SelectorGroup
            title="讀者對象"
            options={audienceOptions}
            selected={audience}
            onSelect={setAudience}
          />
          <SelectorGroup
            title="風格方向"
            options={styleOptions}
            selected={style}
            onSelect={setStyle}
          />
          <SelectorGroup
            title="頁數"
            options={pageCountOptions}
            selected={pageCount}
            onSelect={setPageCount}
          />
        </aside>

        <main className="card p-5">
          <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                繪本預覽
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                每頁都維持簡報式閱讀節奏，方便逐頁調整文字與圖片。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {draftPages.map((_, index) => {
                const pageNumber = index + 1;
                const active = selectedPage === pageNumber;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setSelectedPage(pageNumber)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? "theme-button-accent theme-button-accent-active"
                        : "theme-button-secondary"
                    }`}
                  >
                    P{pageNumber}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-panel)] p-5">
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.85),rgba(219,234,254,0.9),rgba(253,242,248,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <div className="flex min-h-[520px] flex-col rounded-[1.25rem] border border-white/60 bg-white/45 p-5 backdrop-blur-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="chip">
                    <Images className="h-4 w-4" />
                    頁面預覽
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)] sm:text-right">
                    {activeDraft.title}
                  </div>
                </div>

                <div className="grid flex-1 gap-5 pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.78fr)]">
                  <div className="min-h-[360px] rounded-[1.5rem] border border-dashed border-[var(--color-accent-border)] bg-white/60 p-5">
                    <div className="flex h-full flex-col justify-between rounded-[1.25rem] bg-[linear-gradient(180deg,rgba(191,219,254,0.28),rgba(254,249,195,0.35))] p-5">
                      <div className="text-sm font-semibold text-[var(--color-accent-text)]">
                        插圖區域
                      </div>
                      <div className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                        <p>市場晨光、花布提袋、木窗與泛黃照片。</p>
                        <p>畫面風格偏柔和、熟齡友善，人物表情溫暖平靜。</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-[360px] overflow-y-auto rounded-[1.5rem] bg-white/72 p-5 shadow-[0_18px_32px_rgba(15,23,42,0.06)]">
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                      故事文字
                    </div>
                    <h3 className="mt-3 text-xl font-bold leading-snug text-[var(--color-text-primary)]">
                      {activeDraft.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
                      {activeDraft.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="theme-button-secondary rounded-2xl px-4 py-2 text-sm">
                重寫本頁文字
              </button>
              <button className="theme-button-secondary rounded-2xl px-4 py-2 text-sm">
                重生本頁圖片
              </button>
              <button className="theme-button-accent rounded-2xl px-4 py-2 text-sm">
                產生本頁旁白
              </button>
            </div>
          </div>
        </main>

        <aside className="card space-y-5 p-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              生成與輸出
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              右欄保留清楚的操作順序與任務狀態，避免生成流程失去方向。
            </p>
          </div>

          <div className="space-y-3">
            <ActionButton icon={Sparkles} label="產生故事大綱" />
            <ActionButton icon={LayoutTemplate} label="自動分成 5-10 頁" />
            <ActionButton icon={Images} label="生成每頁圖片" />
            <ActionButton icon={Volume2} label="生成整本旁白" />
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-panel)] p-4">
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">
              匯出格式
            </div>
            <div className="mt-3 grid gap-3">
              <button className="theme-button-accent flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm">
                <BookImage className="h-4 w-4" />
                匯出簡報型繪本
              </button>
              <button className="theme-button-secondary flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm">
                <Film className="h-4 w-4" />
                匯出影片（下一階段）
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-panel)] p-4">
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">
              目前狀態
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li>1. 大綱完成，已整理成三個場景。</li>
              <li>2. 分頁草稿已建立，可再擴增到 8 頁。</li>
              <li>3. 第 1 頁與第 2 頁插圖提示詞已準備完成。</li>
              <li>4. 匯出會以簡報形式優先，影片流程暫列為下一步。</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

function SelectorGroup({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-[var(--color-text-primary)]">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-full px-4 py-2 text-sm ${
              selected === option
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

function ActionButton({
  icon: Icon,
  label,
}: {
  icon: typeof Sparkles;
  label: string;
}) {
  return (
    <button className="theme-button-secondary flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm">
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-[var(--color-accent-text)]" />
        {label}
      </span>
      <span className="text-xs text-[var(--color-text-muted)]">準備中</span>
    </button>
  );
}
