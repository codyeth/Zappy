"use client";

import { useMemo } from "react";

const COLORS = ["#EF4444", "#F59E0B", "#22C55E", "#3B82F6", "#A855F7", "#EC4899", "#F97316"];

export default function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        x: Math.random() * 100,
        size: 6 + Math.random() * 7,
        delay: Math.random() * 0.9,
        duration: 2.2 + Math.random() * 1.6,
        rotate: Math.random() * 360,
        isRect: Math.random() > 0.5,
      })),
    []
  );

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-[300] overflow-hidden">
        {particles.map((p) => (
          <span
            key={p.id}
            style={{
              position: "absolute",
              top: 0,
              left: `${p.x}%`,
              width: p.size,
              height: p.isRect ? p.size * 0.5 : p.size,
              background: p.color,
              borderRadius: p.isRect ? "1px" : "50%",
              transform: `rotate(${p.rotate}deg)`,
              animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}
