export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Helper to compute an image thumbnail preview URL for score sheets:
 * - For image URLs (PNG, JPG, WEBP), returns the URL as is.
 * - For PDF URLs, transforms the Cloudinary URL by inserting 'pg_1,f_auto,q_auto,w_600' after '/upload/' and swapping '.pdf' to '.jpg'.
 */
export function getPreviewUrl(url: string): string {
  if (!url) return '';

  // For image URLs (PNG, JPG, WEBP), return the URL as is
  const isImage = /\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(url);
  if (isImage) {
    return url;
  }

  // For PDF URLs, transform the Cloudinary URL
  const isPdf = /\.pdf($|\?)/i.test(url) || url.toLowerCase().includes('.pdf');
  if (isPdf && (url.includes('/upload/') || url.includes('/raw/upload/'))) {
    let preview = url;
    if (preview.includes('/raw/upload/')) {
      preview = preview.replace('/raw/upload/', '/image/upload/');
    }
    preview = preview.replace('/upload/', '/upload/pg_1,f_auto,q_auto,w_600/');
    preview = preview.replace(/\.pdf(\?.*)?$/i, '.jpg$1');
    return preview;
  }

  return url;
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
};

/**
 * Checks if a string is in the valid 'DD-MM' format with valid day (01-31) and month (01-12)
 */
export function isValidBirthday(dateStr?: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  return /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])$/.test(dateStr.trim());
}

/**
 * Formats a 'DD-MM' string into a readable string (e.g. '25 April')
 */
export function formatBirthday(dateStr?: string | null): string {
  if (!isValidBirthday(dateStr)) return '—';
  const [day, month] = (dateStr as string).trim().split('-');
  const monthName = MONTH_NAMES[month] || month;
  const dayNum = parseInt(day, 10);
  return `${dayNum} ${monthName}`;
}

/**
 * Returns YYYY-MM-DD for today in local time
 */
export function getTodayDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns YYYY-MM-DD for yesterday in local time
 */
export function getYesterdayDateKey(date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD date key into a user-friendly string (e.g., "Yesterday (Sep 25, 2026)")
 */
export function formatQuizDateKeyLabel(dateKey: string): string {
  if (!dateKey) return '';
  const todayKey = getTodayDateKey();
  const yesterdayKey = getYesterdayDateKey();

  const [y, m, d] = dateKey.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  const formatted = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (dateKey === yesterdayKey) {
    return `Yesterday (${formatted})`;
  }
  if (dateKey === todayKey) {
    return `Today (${formatted})`;
  }
  return formatted;
}

