import type { MemberRole } from '@/types';

export function normalizeRole(role?: MemberRole | string | null): string {
  if (!role) return '';
  return role.trim().toLowerCase();
}

export function isAdmin(role?: MemberRole | string | null, email?: string | null): boolean {
  if (email) {
    const e = email.trim().toLowerCase();
    if (
      e === 'ovasabatho@gmail.com' ||
      e.startsWith('admin@') ||
      e.includes('+admin@') ||
      e.endsWith('@admin.choir.org')
    ) {
      return true;
    }
  }
  const r = normalizeRole(role);
  return r === 'admin' || r === 'administrator';
}

export function canViewFinances(role?: MemberRole | string | null, email?: string | null): boolean {
  if (isAdmin(role, email)) return true;
  const r = normalizeRole(role);
  return r === 'director' || r === 'section leader' || r === 'executive';
}

export function canEditFinances(role?: MemberRole | string | null, email?: string | null): boolean {
  return isAdmin(role, email);
}

export function canManageMembers(role?: MemberRole | string | null, email?: string | null): boolean {
  if (isAdmin(role, email)) return true;
  const r = normalizeRole(role);
  return (
    r === 'director' ||
    r === 'choir director' ||
    r === 'music director' ||
    r === 'section leader' ||
    r === 'section_leader' ||
    r === 'sectionleader'
  );
}

export function canAddMember(role?: MemberRole | string | null, email?: string | null): boolean {
  if (isAdmin(role, email)) return true;
  const r = normalizeRole(role);
  return (
    r === 'director' ||
    r === 'choir director' ||
    r === 'music director' ||
    r === 'section leader' ||
    r === 'section_leader' ||
    r === 'sectionleader'
  );
}

export function canEditMember(role?: MemberRole | string | null, email?: string | null): boolean {
  return isAdmin(role, email);
}

export function canDeleteMember(role?: MemberRole | string | null, email?: string | null): boolean {
  return isAdmin(role, email);
}

export function canManageMusic(role?: MemberRole | string | null, email?: string | null): boolean {
  if (isAdmin(role, email)) return true;
  const r = normalizeRole(role);
  return (
    r === 'director' ||
    r === 'choir director' ||
    r === 'music director' ||
    r === 'section leader' ||
    r === 'section_leader' ||
    r === 'sectionleader' ||
    r === 'member' ||
    !r
  );
}

export function canViewActivityLog(role?: MemberRole | string | null, email?: string | null): boolean {
  return isAdmin(role, email);
}



