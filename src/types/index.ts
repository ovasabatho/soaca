export type VoicePart = 'Soprano' | 'Alto' | 'Tenor' | 'Bass';
export type MemberRole = 'Member' | 'Section Leader' | 'Director' | 'Accompanist' | 'Admin';
export type MemberStatus = 'Active' | 'Inactive' | 'On Leave';
export type PaymentMethod = 'Cash' | 'Check' | 'Bank Transfer' | 'Card' | 'Other';
export type PaymentStatus = 'Paid' | 'Partial' | 'Pending' | 'Waived';

export interface Member {
  id: string;
  uid?: string | null;
  user_id?: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  photoURL: string | null;
  voice_part: VoicePart;
  role: MemberRole;
  status: MemberStatus;
  join_date: string | null;
  birthdate?: string | null;
  notes: string | null;
  created_at: string;
}

export interface DuesPeriod {
  id: string;
  name: string;
  amount: number;
  start_date: string;
  due_date: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DuesPayment {
  id: string;
  member_id: string;
  period_id: string;
  amount_paid: number;
  memberId?: string;
  periodId?: string;
  amountPaid?: number;
  payment_date: string | null;
  paymentDate?: string | null;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface PaymentWithMember extends DuesPayment {
  member?: Member;
}

export interface PaymentWithDetails extends DuesPayment {
  member?: Member;
  period?: DuesPeriod;
}

export const VOICE_PARTS: VoicePart[] = ['Soprano', 'Alto', 'Tenor', 'Bass'];
export const MEMBER_ROLES: MemberRole[] = ['Member', 'Section Leader', 'Director', 'Accompanist', 'Admin'];

export interface Announcement {
  id: string;
  title: string;
  content: string;
  updated_at: string;
  updated_by: string | null;
}

export interface OrderOfMass {
  id: string;
  title: string;
  content: string;
  mass_date: string | null;
  updated_at: string;
  updated_by: string | null;
}
export const MEMBER_STATUSES: MemberStatus[] = ['Active', 'Inactive', 'On Leave'];
export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Check', 'Bank Transfer', 'Card', 'Other'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['Paid', 'Partial', 'Pending', 'Waived'];

export type SongVoicePart = 'All' | VoicePart;

export interface Song {
  id: string;
  title: string;
  category: string;
  voicePart: SongVoicePart | string;
  fileUrl: string;
  fileType: 'pdf' | 'image';
  pageCount?: number | null;
  pages?: string[] | null;
  storagePath?: string | null;
  fileSize?: number | null;
  fileName?: string | null;
  uploadedBy?: string | null;
  uploaderName?: string | null;
  createdAt: string;
  updatedAt?: string;
  notes?: string | null;
}

export const LITURGICAL_CATEGORIES = [
  'Entrance hymns',
  'Kyrie',
  'Gloria',
  'Acclamation',
  'Creed',
  'Prayers of the faithful',
  'Offertory hymns',
  'Consecration hymns',
  'Sanctus (Holy Holy)',
  'Agnus Dei (Lamb of God)',
  'Communion hymns',
  'Recessional hymns',
  'Advent hymns',
  'Lenten hymns',
  'Easter hymns',
  'Christmas hymns',
  'Special hymns',
] as const;

export type LiturgicalCategory = (typeof LITURGICAL_CATEGORIES)[number];
export const SONG_CATEGORIES = LITURGICAL_CATEGORIES;

export const SONG_VOICE_PARTS: SongVoicePart[] = ['All', 'Soprano', 'Alto', 'Tenor', 'Bass'];

export interface QuizScore {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string | null;
  userPhoto?: string | null;
  voicePart?: VoicePart | string | null;
  score: number;
  totalQuestions: number;
  percentage: number;
  dateKey: string; // YYYY-MM-DD
  timeTakenSeconds?: number;
  createdAt: string;
}

export interface GuruProfile {
  userId: string;
  userName: string;
  userPhoto?: string | null;
  voicePart?: VoicePart | string | null;
  score: number;
  totalQuestions: number;
  percentage: number;
  dateKey: string; // YYYY-MM-DD
  dateLabel: string; // e.g., "Today" or "Yesterday (Sep 25, 2026)"
  isToday: boolean;
  isYesterday: boolean;
  achievedAt?: string;
  timeTakenSeconds?: number;
}

export interface DailyMusicGuru extends GuruProfile {
  tiedGurus?: GuruProfile[];
}

export interface ReigningGuruData {
  hasTodayGuru: boolean;
  isTie: boolean;
  todayGurus: GuruProfile[];
  topScore: number;
  percentage: number;
  dateKey: string;
  dateLabel: string;
  previousGuru: GuruProfile | null;
  previousGurus: GuruProfile[];
}

export type ActivityType =
  | 'login'
  | 'member_registered'
  | 'member_created'
  | 'member_updated'
  | 'member_deleted'
  | 'payment_recorded'
  | 'payment_updated'
  | 'payment_cleared'
  | 'period_created'
  | 'period_updated'
  | 'period_deleted'
  | 'song_uploaded'
  | 'song_deleted'
  | 'quiz_completed'
  | 'announcement_updated'
  | 'order_of_mass_updated'
  | 'manual_log';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  actor_id?: string | null;
  actor_name?: string | null;
  actor_email?: string | null;
  actor_role?: string | null;
  target_id?: string | null;
  target_name?: string | null;
  action: string;
  details?: Record<string, unknown> | null;
  timestamp: string;
}

