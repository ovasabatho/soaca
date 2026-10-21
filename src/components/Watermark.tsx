export function Watermark() {
  return (
    <img
      src="/logo.png"
      alt=""
      aria-hidden
      className="pointer-events-none fixed left-1/2 top-1/2 z-0 w-[380px] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
    />
  );
}
