import { useEffect } from "react";

export default function AmbientMotionLayer() {
  useEffect(() => {
    const root = document.documentElement;
    let rafId = 0;

    const updateCursor = (x: number, y: number) => {
      root.style.setProperty("--cursor-x", `${x}px`);
      root.style.setProperty("--cursor-y", `${y}px`);
    };

    const handleMove = (event: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateCursor(event.clientX, event.clientY);
      });
    };

    const handleLeave = () => {
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      updateCursor(x, y);
    };

    handleLeave();
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div className="ambient-motion-layer" aria-hidden="true">
      <div className="ambient-orb ambient-orb-primary" />
      <div className="ambient-orb ambient-orb-secondary" />
      <div className="ambient-cursor-glow" />
    </div>
  );
}
