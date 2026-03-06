interface PlaceholderThumbnailProps {
  title: string;
  gradient: string;
  className?: string;
}

export default function PlaceholderThumbnail({
  title,
  gradient,
  className = "",
}: PlaceholderThumbnailProps) {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      style={{ background: gradient }}
    >
      {/* Decorative circles */}
      <div className="absolute top-2 right-3 w-8 h-8 bg-white/10 rounded-full" />
      <div className="absolute bottom-3 left-2 w-5 h-5 bg-white/10 rounded-full" />
      <div className="absolute top-1/2 left-3 w-3 h-3 bg-white/15 rounded-full" />

      {/* Game title */}
      <p
        className="relative z-10 text-white font-bold text-center px-2 drop-shadow-md"
        style={{ fontSize: "clamp(10px, 2.5vw, 13px)", lineHeight: "1.3" }}
      >
        {title}
      </p>
    </div>
  );
}
