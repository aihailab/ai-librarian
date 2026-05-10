export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="card p-10 text-[var(--color-text-secondary)]">
      <h1 className="mb-2 text-2xl font-bold text-[var(--color-text-primary)]">
        {title}
      </h1>
      <p>這個分頁先保留，之後再實作內容。</p>
    </div>
  );
}
