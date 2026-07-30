import { Camera } from "lucide-react";

/**
 * Shared product image thumbnail with camera placeholder fallback.
 * `size` is a tailwind size class, defaults to the 65px catalogue thumb.
 */
export function ProductThumb({
  src,
  name,
  className = "size-[65px]",
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-soft ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="size-full object-cover" loading="lazy" />
      ) : (
        <Camera className="size-1/3 text-primary/60" />
      )}
    </div>
  );
}
