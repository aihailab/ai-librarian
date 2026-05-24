import { useState } from "react";

export default function Popover({
  children,
  content,
  className = "inline-block",
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`relative ${className}`}

      onMouseEnter={() => setOpen(true)}

      onMouseLeave={() => setOpen(false)}
    >
      {children}

      {open && (
        <div
          className="theme-popover absolute right-0 top-full z-50 mt-2 w-56 rounded-lg p-3 text-sm animate-fadeIn"
        >
          {content}
        </div>
      )}
    </div>
  );
}
