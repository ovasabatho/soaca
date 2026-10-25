import type { Member } from '@/types';
import { isValidBirthday } from './format';

export interface BirthdayInfo {
  member: Member;
  daysUntil: number;
  formattedDate: string; // e.g. "Oct 28"
  isToday: boolean;
}

export function parseBirthdate(birthdateStr?: string | null): { day: number; month: number } | null {
  if (!isValidBirthday(birthdateStr)) return null;
  const [dayStr, monthStr] = (birthdateStr as string).trim().split('-');
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10); // 1-12
  if (isNaN(day) || isNaN(month)) return null;
  return { day, month };
}

export function isTodayBirthday(birthdateStr?: string | null): boolean {
  const parsed = parseBirthdate(birthdateStr);
  if (!parsed) return false;
  const now = new Date();
  return now.getDate() === parsed.day && (now.getMonth() + 1) === parsed.month;
}

const MONTH_SHORT_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getUpcomingBirthdays(members: Member[] = [], daysAhead = 30): { today: BirthdayInfo[]; upcoming: BirthdayInfo[] } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const todayList: BirthdayInfo[] = [];
  const upcomingList: BirthdayInfo[] = [];

  for (const member of members) {
    if (!member || !member.birthdate) continue;
    const parsed = parseBirthdate(member.birthdate);
    if (!parsed) continue;

    // Check this year's birthday
    const bdayThisYear = new Date(today.getFullYear(), parsed.month - 1, parsed.day);
    let diffTime = bdayThisYear.getTime() - today.getTime();
    let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // If birthday already passed this year, check next year
    if (diffDays < 0) {
      const bdayNextYear = new Date(today.getFullYear() + 1, parsed.month - 1, parsed.day);
      diffTime = bdayNextYear.getTime() - today.getTime();
      diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    }

    if (diffDays >= 0 && diffDays <= daysAhead) {
      const monthName = MONTH_SHORT_NAMES[parsed.month] || '';
      const formattedDate = `${monthName} ${parsed.day}`;
      const info: BirthdayInfo = {
        member,
        daysUntil: diffDays,
        formattedDate,
        isToday: diffDays === 0,
      };

      if (diffDays === 0) {
        todayList.push(info);
      } else {
        upcomingList.push(info);
      }
    }
  }

  // Sort upcoming by daysUntil ascending
  upcomingList.sort((a, b) => a.daysUntil - b.daysUntil);
  todayList.sort((a, b) => fullName(a.member.first_name, a.member.last_name).localeCompare(fullName(b.member.first_name, b.member.last_name)));

  return { today: todayList, upcoming: upcomingList };
}

function fullName(first: string, last: string) {
  return `${first || ''} ${last || ''}`.trim();
}
