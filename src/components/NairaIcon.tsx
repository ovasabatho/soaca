interface IconProps {
  className?: string;
}

export function NairaIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <span className={`inline-flex items-center justify-center font-bold leading-none ${className}`} style={{ fontSize: 'inherit' }}>
      ₦
    </span>
  );
}
