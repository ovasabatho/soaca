import { initials } from '@/lib/format';

interface AvatarProps {
  firstName: string;
  lastName: string;
  photoURL?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'h-8 w-8 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-10 w-10 text-xs',
  lg: 'h-16 w-16 text-base',
  xl: 'h-24 w-24 text-2xl',
};

const ringSizeMap = {
  xs: 'ring-2',
  sm: 'ring-2',
  md: 'ring-2',
  lg: 'ring-4',
  xl: 'ring-4',
};

export function Avatar({ firstName, lastName, photoURL, size = 'sm', className = '' }: AvatarProps) {
  const base = `${sizeMap[size]} ${ringSizeMap[size]} flex-shrink-0 rounded-full object-cover ring-white dark:ring-slate-800`;

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={`${firstName} ${lastName}`}
        className={`${base} ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} ${className} flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-sky-200 font-semibold text-sky-700`}
    >
      {initials(firstName, lastName)}
    </div>
  );
}
