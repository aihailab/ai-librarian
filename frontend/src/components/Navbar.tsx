import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import FontSizeController from "./FontSizeController";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-neutral-950/70 backdrop-blur-lg border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
        {/* 左 LOGO */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition"
        >
          <BookOpen className="w-7 h-7 text-sky-400" />
          <div>
            <div className="text-neutral-100 font-bold">AI Librarian</div>
            <div className="text-xs text-neutral-400">智慧搜尋幫手</div>
          </div>
        </Link>

        {/* 右側字體控制鈕 */}
        <div className="flex items-center gap-3">
          <span className="text-neutral-400 text-xs sm:text-sm">字體大小</span>
          <FontSizeController
            variant="inline"
            className="bg-neutral-900/40 border border-neutral-800 rounded-full px-3 py-1"
          />
        </div>
      </div>
    </nav>
  );
}
