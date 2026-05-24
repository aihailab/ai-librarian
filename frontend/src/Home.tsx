import { useNavigate } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./theme";

export default function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const particleClass =
    theme === "light" ? "bg-sky-300/60" : "bg-white/80";

  return (
    <div className="home-shell relative z-10">
      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className={`absolute h-1.5 w-1.5 rounded-full opacity-70 animate-float ${particleClass}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${5 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-6">
        <h1 className="home-title mb-6 text-4xl font-bold md:text-6xl">
          Unlock knowledge, powered by AI.
        </h1>

        <button
          onClick={() => navigate("/librarian")}
          className="theme-button-primary motion-button rounded-full px-10 py-4 text-lg font-semibold"
        >
          Start
        </button>
      </div>
    </div>
  );
}
