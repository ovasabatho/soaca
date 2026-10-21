import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  getDocs,
  setDoc,
  where,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db, firebaseConfig } from './firebase';
import type {
  Member,
  DuesPeriod,
  DuesPayment,
  PaymentMethod,
  PaymentStatus,
  Announcement,
  OrderOfMass,
  VoicePart,
  MemberRole,
  MemberStatus,
  Song,
  QuizScore,
  DailyMusicGuru,
  ActivityLog,
  ActivityType,
} from '@/types';
import { normalizePaymentStatus } from './dues';
import { getTodayDateKey, getYesterdayDateKey, formatQuizDateKeyLabel } from './format';

const membersCol = collection(db, 'members');
const periodsCol = collection(db, 'dues_periods');
const paymentsCol = collection(db, 'dues_payments');
const songsCol = collection(db, 'songs');
const quizScoresCol = collection(db, 'quiz_scores');
const activityLogsCol = collection(db, 'activity_logs');

export function subscribeToMembers(cb: (members: Member[]) => void): () => void {
  return onSnapshot(
    query(membersCol),
    (snap) => {
      const list: Member[] = snap.docs.map((d) => {
        const data = d.data();
        const rawRole = String(data.role || 'Member').trim().toLowerCase();
        let normalizedRole: MemberRole = 'Member';
        if (rawRole === 'admin' || rawRole === 'administrator') normalizedRole = 'Admin';
        else if (rawRole === 'director' || rawRole === 'choir director' || rawRole === 'music director') normalizedRole = 'Director';
        else if (rawRole === 'section leader' || rawRole === 'section_leader' || rawRole === 'sectionleader') normalizedRole = 'Section Leader';
        else if (rawRole === 'accompanist') normalizedRole = 'Accompanist';
        else normalizedRole = 'Member';

        const rawStatus = String(data.status || 'Active').trim().toLowerCase();
        let normalizedStatus: MemberStatus = 'Active';
        if (rawStatus === 'inactive') normalizedStatus = 'Inactive';
        else if (rawStatus === 'on leave' || rawStatus === 'on_leave' || rawStatus === 'onleave') normalizedStatus = 'On Leave';
        else normalizedStatus = 'Active';

        const rawVoice = String(data.voicePart || data.voice_part || 'Soprano').trim();
        let normalizedVoice: VoicePart = 'Soprano';
        if (/alto/i.test(rawVoice)) normalizedVoice = 'Alto';
        else if (/tenor/i.test(rawVoice)) normalizedVoice = 'Tenor';
        else if (/bass/i.test(rawVoice)) normalizedVoice = 'Bass';
        else normalizedVoice = 'Soprano';

        let createdAtStr = new Date().toISOString();
        if (data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt) {
          createdAtStr = (data.createdAt as { toDate: () => Date }).toDate().toISOString();
        } else if (data.created_at && typeof data.created_at === 'object' && 'toDate' in data.created_at) {
          createdAtStr = (data.created_at as { toDate: () => Date }).toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdAtStr = data.createdAt;
        } else if (typeof data.created_at === 'string') {
          createdAtStr = data.created_at;
        }

        let joinDateStr: string | null = null;
        if (data.joinDate) {
          joinDateStr =
            typeof data.joinDate === 'string'
              ? data.joinDate
              : typeof data.joinDate === 'object' && 'toDate' in data.joinDate
                ? (data.joinDate as { toDate: () => Date }).toDate().toISOString().split('T')[0]
                : null;
        } else if (data.join_date) {
          joinDateStr =
            typeof data.join_date === 'string'
              ? data.join_date
              : typeof data.join_date === 'object' && 'toDate' in data.join_date
                ? (data.join_date as { toDate: () => Date }).toDate().toISOString().split('T')[0]
                : null;
        }

        return {
          id: d.id,
          uid: data.uid ?? data.user_id ?? d.id,
          user_id: data.user_id ?? data.uid ?? d.id,
          first_name: data.firstName ?? data.first_name ?? '',
          last_name: data.lastName ?? data.last_name ?? '',
          email: data.email ?? null,
          phone: data.phone ?? data.phoneNumber ?? null,
          photoURL: data.photoURL ?? data.photo_url ?? null,
          voice_part: normalizedVoice,
          role: normalizedRole,
          status: normalizedStatus,
          join_date: joinDateStr,
          birthdate: data.birthdate ?? null,
          notes: data.notes ?? null,
          created_at: createdAtStr,
        };
      });
      cb(list);
    },
    (err) => {
      console.error('Members subscription error:', err);
      cb([]);
    }
  );
}

export function subscribeToPeriods(cb: (periods: DuesPeriod[]) => void): () => void {
  return onSnapshot(
    query(periodsCol),
    (snap) => {
      const list: DuesPeriod[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? '',
          amount: data.amount ?? 0,
          start_date: data.start_date ?? new Date().toISOString().split('T')[0],
          due_date: data.due_date ?? new Date().toISOString().split('T')[0],
          description: data.description ?? null,
          is_active: data.is_active ?? true,
          created_at: data.created_at ?? new Date().toISOString(),
        };
      });
      cb(list);
    },
    (err) => {
      console.error('Periods subscription error:', err);
      cb([]);
    }
  );
}

export interface SubscribePaymentsOptions {
  canViewAll?: boolean;
  memberId?: string | null;
  userId?: string | null;
}

export function subscribeToPayments(
  cb: (payments: DuesPayment[]) => void,
  options?: SubscribePaymentsOptions
): () => void {
  const canViewAll = options ? (options.canViewAll ?? false) : true;
  const targetId = options?.userId || options?.memberId;

  // If user cannot view all finances and has no target member ID, don't query
  if (!canViewAll && !targetId) {
    cb([]);
    return () => {};
  }

  // If the user does not have permission to view choir-wide finances, query only their own payments
  // Use memberId == targetId (matching security rule request.auth.uid)
  const primaryQuery = !canViewAll && targetId
    ? query(paymentsCol, where('memberId', '==', targetId))
    : query(paymentsCol);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapSnapshot = (snap: any): DuesPayment[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return snap.docs.map((d: any) => {
      const data = d.data();
      const rawStatus = data.status ?? 'Pending';
      const normalizedStatus: PaymentStatus = normalizePaymentStatus(rawStatus);

      const rawPaymentDate = data.paymentDate ?? data.payment_date ?? null;

      return {
        id: d.id,
        member_id: data.memberId ?? data.member_id ?? '',
        memberId: data.memberId ?? data.member_id ?? '',
        period_id: data.periodId ?? data.period_id ?? '',
        periodId: data.periodId ?? data.period_id ?? '',
        amount_paid: Number(data.amountPaid ?? data.amount_paid ?? 0),
        amountPaid: Number(data.amountPaid ?? data.amount_paid ?? 0),
        payment_date: rawPaymentDate,
        paymentDate: rawPaymentDate,
        payment_method: data.payment_method ?? 'Cash',
        status: normalizedStatus,
        reference_number: data.reference_number ?? null,
        notes: data.notes ?? null,
        created_at: data.created_at ?? new Date().toISOString(),
      };
    });
  };

  let activeUnsub: (() => void) | null = null;
  let isCancelled = false;

  activeUnsub = onSnapshot(
    primaryQuery,
    (snap) => {
      if (!isCancelled) {
        cb(mapSnapshot(snap));
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err: any) => {
      if (isCancelled) return;

      const isPermissionError =
        err?.code === 'permission-denied' ||
        err?.message?.toLowerCase().includes('permission') ||
        err?.message?.toLowerCase().includes('insufficient');

      // If query was rejected and we have a member ID, fallback to member-level query
      if (isPermissionError && targetId) {
        console.warn('Payments access restricted; trying member-level fallback query.');
        try {
          const fallbackQuery = query(paymentsCol, where('memberId', '==', targetId));
          activeUnsub = onSnapshot(
            fallbackQuery,
            (snap) => {
              if (!isCancelled) {
                cb(mapSnapshot(snap));
              }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (fallbackErr: any) => {
              if (isCancelled) return;
              try {
                // Secondary fallback with snake_case member_id
                const secondaryFallback = query(paymentsCol, where('member_id', '==', targetId));
                activeUnsub = onSnapshot(
                  secondaryFallback,
                  (snap2) => {
                    if (!isCancelled) cb(mapSnapshot(snap2));
                  },
                  () => {
                    if (!isCancelled) cb([]);
                  }
                );
              } catch {
                console.warn('Member-level payments fallback error:', fallbackErr);
                cb([]);
              }
            }
          );
          return;
        } catch {
          cb([]);
          return;
        }
      }

      if (isPermissionError) {
        console.warn('Payments access restricted for current user:', err?.message || err);
      } else {
        console.error('Payments subscription error:', err);
      }
      cb([]);
    }
  );

  return () => {
    isCancelled = true;
    if (activeUnsub) {
      activeUnsub();
    }
  };
}

/**
 * Directly queries payments where memberId == currentUser.uid so members immediately see their updated balance.
 */
export function subscribeToMemberPaymentsByUid(
  currentUserUid: string,
  cb: (payments: DuesPayment[]) => void
): () => void {
  const q = query(paymentsCol, where('memberId', '==', currentUserUid));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapSnap = (snap: any): DuesPayment[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return snap.docs.map((d: any) => {
      const data = d.data();
      const rawStatus = data.status ?? 'Pending';
      const normalizedStatus: PaymentStatus = normalizePaymentStatus(rawStatus);

      const rawPaymentDate = data.paymentDate ?? data.payment_date ?? null;

      return {
        id: d.id,
        member_id: data.memberId ?? data.member_id ?? currentUserUid,
        memberId: data.memberId ?? data.member_id ?? currentUserUid,
        period_id: data.periodId ?? data.period_id ?? '',
        periodId: data.periodId ?? data.period_id ?? '',
        amount_paid: Number(data.amountPaid ?? data.amount_paid ?? 0),
        amountPaid: Number(data.amountPaid ?? data.amount_paid ?? 0),
        payment_date: rawPaymentDate,
        paymentDate: rawPaymentDate,
        payment_method: data.payment_method ?? 'Cash',
        status: normalizedStatus,
        reference_number: data.reference_number ?? null,
        notes: data.notes ?? null,
        created_at: data.created_at ?? new Date().toISOString(),
      };
    });
  };

  let fallbackUnsub: (() => void) | null = null;
  const primaryUnsub = onSnapshot(
    q,
    (snap) => {
      cb(mapSnap(snap));
    },
    (err) => {
      console.warn('Error querying memberId == currentUser.uid; attempting fallback:', err);
      try {
        const fallbackQ = query(paymentsCol, where('member_id', '==', currentUserUid));
        fallbackUnsub = onSnapshot(
          fallbackQ,
          (snap2) => cb(mapSnap(snap2)),
          () => cb([])
        );
      } catch {
        cb([]);
      }
    }
  );

  return () => {
    primaryUnsub();
    if (fallbackUnsub) fallbackUnsub();
  };
}

export async function addMember(
  data: Omit<Member, 'id' | 'created_at'> & { uid?: string | null; user_id?: string | null },
  customUid?: string
): Promise<string> {
  const docId = customUid || data.uid || data.user_id;
  const nowStr = new Date().toISOString();
  const joinDateVal = data.join_date || nowStr.split('T')[0];

  const payload = {
    ...data,
    role: data.role || 'Member',
    status: data.status || 'Active',
    firstName: data.first_name,
    lastName: data.last_name,
    voicePart: data.voice_part,
    joinDate: joinDateVal,
    createdAt: serverTimestamp(),
    created_at: nowStr,
    updated_at: nowStr,
  };

  if (docId) {
    await setDoc(
      doc(db, 'members', docId),
      {
        ...payload,
        uid: docId,
        user_id: docId,
      },
      { merge: true }
    );
    return docId;
  } else {
    const docRef = await addDoc(membersCol, payload);
    await setDoc(docRef, { uid: docRef.id, user_id: docRef.id }, { merge: true });
    return docRef.id;
  }
}

export async function createMemberWithAuth(
  email: string,
  password: string,
  profile: Omit<Member, 'id' | 'created_at'>
): Promise<string> {
  const secondaryApp = initializeApp(firebaseConfig, 'secondary-' + Date.now());
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const userUid = cred.user.uid;
    const nowStr = new Date().toISOString();
    const joinDateVal = profile.join_date || nowStr.split('T')[0];

    // Save profile in the members collection, keyed directly by the new user's Auth UID
    await setDoc(doc(db, 'members', userUid), {
      ...profile,
      email: email.trim(),
      firstName: profile.first_name,
      lastName: profile.last_name,
      voicePart: profile.voice_part,
      joinDate: joinDateVal,
      role: profile.role || 'Member',
      status: profile.status || 'Active',
      uid: userUid,
      user_id: userUid,
      createdAt: serverTimestamp(),
      created_at: nowStr,
      updated_at: nowStr,
    });
    // Sign out the secondary instance so it doesn't hold a session
    await signOut(secondaryAuth);
    return userUid;
  } catch (err) {
    try { await signOut(secondaryAuth); } catch { /* ignore */ }
    throw err;
  }
}

export async function selfRegisterMember(
  email: string,
  password: string,
  profile: {
    first_name: string;
    last_name: string;
    phone?: string | null;
    photoURL?: string | null;
    voice_part: VoicePart;
    join_date?: string | null;
    birthdate: string;
    notes?: string | null;
  }
): Promise<string> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const userUid = cred.user.uid;
  const nowStr = new Date().toISOString();
  const joinDateVal = profile.join_date || nowStr.split('T')[0];

  // Document ID Alignment: Save profile directly under members with document ID = user.uid
  // Explicitly include all required fields: role: 'member', status: 'active', createdAt: serverTimestamp(),
  // voicePart, email, firstName, lastName, phone, joinDate alongside snake_case aliases.
  await setDoc(doc(db, 'members', userUid), {
    role: 'member',
    status: 'active',
    createdAt: serverTimestamp(),
    voicePart: profile.voice_part,
    email: email.trim(),
    firstName: profile.first_name.trim(),
    lastName: profile.last_name.trim(),
    phone: profile.phone?.trim() || null,
    joinDate: joinDateVal,
    birthdate: profile.birthdate.trim(),

    // Aliases for comprehensive cross-component compatibility:
    first_name: profile.first_name.trim(),
    last_name: profile.last_name.trim(),
    voice_part: profile.voice_part,
    join_date: joinDateVal,
    photoURL: profile.photoURL || null,
    photo_url: profile.photoURL || null,
    notes: profile.notes?.trim() || null,
    uid: userUid,
    user_id: userUid,
    created_at: nowStr,
    updated_at: nowStr,
  });

  logActivity({
    type: 'member_registered',
    actor_id: userUid,
    actor_name: `${profile.first_name.trim()} ${profile.last_name.trim()}`,
    actor_email: email.trim(),
    actor_role: 'Member',
    target_id: userUid,
    target_name: `${profile.first_name.trim()} ${profile.last_name.trim()}`,
    action: `${profile.first_name.trim()} ${profile.last_name.trim()} self-registered as a new choir member (${profile.voice_part})`,
    details: {
      voice_part: profile.voice_part,
      role: 'Member',
      status: 'Active',
      join_date: joinDateVal,
      phone: profile.phone?.trim() || null,
    },
    timestamp: nowStr,
  }).catch((err) => console.warn('Could not record registration log:', err));

  return userUid;
}

export async function updateMember(id: string, data: Partial<Member>): Promise<void> {
  const nowIso = new Date().toISOString();
  const payload: Record<string, unknown> = {
    ...data,
    updated_at: nowIso,
  };

  // Explicitly write all standard and alias fields so all queries & subscriptions reflect immediately
  if (data.role !== undefined) {
    payload.role = data.role;
  }
  if (data.first_name !== undefined) {
    payload.firstName = data.first_name;
    payload.first_name = data.first_name;
  }
  if (data.last_name !== undefined) {
    payload.lastName = data.last_name;
    payload.last_name = data.last_name;
  }
  if (data.voice_part !== undefined) {
    payload.voicePart = data.voice_part;
    payload.voice_part = data.voice_part;
  }
  if (data.status !== undefined) {
    payload.status = data.status;
  }
  if (data.join_date !== undefined) {
    payload.joinDate = data.join_date;
    payload.join_date = data.join_date;
  }
  if (data.photoURL !== undefined) {
    payload.photoURL = data.photoURL;
    payload.photo_url = data.photoURL;
  }

  // Update primary document
  await setDoc(doc(db, 'members', id), payload, { merge: true });

  // If member has a separate uid, also update uid-keyed document
  if (data.uid && data.uid !== id) {
    try {
      await setDoc(doc(db, 'members', data.uid), payload, { merge: true });
    } catch {
      // ignore
    }
  }
}

export async function deleteMember(id: string): Promise<void> {
  await deleteDoc(doc(db, 'members', id));
}

export async function addPeriod(data: Omit<DuesPeriod, 'id' | 'created_at'>): Promise<string> {
  const docRef = await addDoc(periodsCol, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updatePeriod(id: string, data: Partial<DuesPeriod>): Promise<void> {
  const payload: Record<string, unknown> = {
    ...data,
    updated_at: new Date().toISOString(),
  };
  await setDoc(doc(db, 'dues_periods', id), payload, { merge: true });
}

export async function deletePeriod(id: string): Promise<void> {
  await deleteDoc(doc(db, 'dues_periods', id));
}

export async function upsertPayment(
  memberId: string,
  periodId: string,
  data: {
    amount_paid?: number;
    amountPaid?: number;
    payment_date?: string | null;
    paymentDate?: string | null;
    payment_method?: PaymentMethod;
    status?: PaymentStatus | string;
    reference_number?: string | null;
    notes?: string | null;
    memberId?: string;
    periodId?: string;
  },
  existingPaymentId?: string
): Promise<string> {
  const actualMemberId = data.memberId ?? memberId;
  const actualPeriodId = data.periodId ?? periodId;
  const actualAmount = Number(data.amountPaid ?? data.amount_paid ?? 0);
  const rawStatus = data.status ?? (actualAmount > 0 ? 'Paid' : 'Pending');
  const statusToSave = normalizePaymentStatus(rawStatus);

  const actualPaymentDate =
    data.paymentDate ?? data.payment_date ?? new Date().toISOString().split('T')[0];

  const docPayload = {
    // Specifically required primary fields:
    memberId: actualMemberId,
    periodId: actualPeriodId,
    amountPaid: actualAmount,
    paymentDate: actualPaymentDate,
    status: statusToSave,

    // Backward-compatible aliases:
    member_id: actualMemberId,
    period_id: actualPeriodId,
    amount_paid: actualAmount,
    payment_date: actualPaymentDate,

    payment_method: data.payment_method ?? 'Cash',
    paymentMethod: data.payment_method ?? 'Cash',
    reference_number: data.reference_number ?? '',
    referenceNumber: data.reference_number ?? '',
    notes: data.notes ?? '',
    updated_at: new Date().toISOString(),
  };

  if (existingPaymentId) {
    await setDoc(doc(db, 'dues_payments', existingPaymentId), docPayload, { merge: true });
    return existingPaymentId;
  } else {
    const docRef = await addDoc(paymentsCol, {
      ...docPayload,
      created_at: new Date().toISOString(),
    });
    return docRef.id;
  }
}

export async function clearPayment(paymentId: string): Promise<void> {
  await deleteDoc(doc(db, 'dues_payments', paymentId));
}

export async function ensureCollectionsExist(): Promise<void> {
  // Firestore creates collections on first write; this is a no-op check
  // but ensures we can at least read empty collections without errors
  await getDocs(query(membersCol)).catch(() => {});
}

// --- Announcements ---

const ANNOUNCEMENT_DOC_ID = 'current';

export function subscribeToAnnouncement(cb: (announcement: Announcement | null) => void): () => void {
  // Listen directly to the announcements collection in real time
  return onSnapshot(
    collection(db, 'announcements'),
    (snap) => {
      if (snap.empty) {
        cb(null);
        return;
      }
      const currentDoc = snap.docs.find((d) => d.id === ANNOUNCEMENT_DOC_ID);
      const chosenDoc =
        currentDoc ??
        snap.docs.slice().sort((a, b) => {
          const timeA = a.data().updated_at || a.data().created_at || '';
          const timeB = b.data().updated_at || b.data().created_at || '';
          return timeB.localeCompare(timeA);
        })[0];

      if (!chosenDoc) {
        cb(null);
        return;
      }

      const data = chosenDoc.data();
      cb({
        id: chosenDoc.id,
        title: data.title ?? '',
        content: data.content ?? '',
        updated_at: data.updated_at ?? new Date().toISOString(),
        updated_by: data.updated_by ?? null,
      });
    },
    (err) => {
      console.warn('Announcements subscription warning:', err);
      cb(null);
    }
  );
}

export async function saveAnnouncement(title: string, content: string, updatedBy: string | null): Promise<void> {
  const now = new Date().toISOString();
  await setDoc(doc(db, 'announcements', ANNOUNCEMENT_DOC_ID), {
    title,
    content,
    updated_at: now,
    updated_by: updatedBy,
  }, { merge: true });
}

// --- Order of Mass ---

const ORDER_DOC_ID = 'current';

export function subscribeToOrderOfMass(cb: (order: OrderOfMass | null) => void): () => void {
  // Listen directly to the order_of_mass collection in real time
  return onSnapshot(
    collection(db, 'order_of_mass'),
    (snap) => {
      if (snap.empty) {
        cb(null);
        return;
      }
      const currentDoc = snap.docs.find((d) => d.id === ORDER_DOC_ID);
      const chosenDoc =
        currentDoc ??
        snap.docs.slice().sort((a, b) => {
          const timeA = a.data().updated_at || a.data().created_at || '';
          const timeB = b.data().updated_at || b.data().created_at || '';
          return timeB.localeCompare(timeA);
        })[0];

      if (!chosenDoc) {
        cb(null);
        return;
      }

      const data = chosenDoc.data();
      cb({
        id: chosenDoc.id,
        title: data.title ?? '',
        content: data.content ?? '',
        mass_date: data.mass_date ?? null,
        updated_at: data.updated_at ?? new Date().toISOString(),
        updated_by: data.updated_by ?? null,
      });
    },
    (err) => {
      console.warn('Order of Mass subscription warning:', err);
      cb(null);
    }
  );
}

export async function saveOrderOfMass(title: string, content: string, massDate: string | null, updatedBy: string | null): Promise<void> {
  const now = new Date().toISOString();
  await setDoc(doc(db, 'order_of_mass', ORDER_DOC_ID), {
    title,
    content,
    mass_date: massDate,
    updated_at: now,
    updated_by: updatedBy,
  }, { merge: true });
}

export function subscribeToSongs(cb: (songs: Song[]) => void): () => void {
  return onSnapshot(
    query(songsCol),
    (snap) => {
      const list: Song[] = snap.docs.map((d) => {
        const data = d.data();
        let createdAtStr = new Date().toISOString();
        if (data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt) {
          createdAtStr = (data.createdAt as { toDate: () => Date }).toDate().toISOString();
        } else if (data.created_at && typeof data.created_at === 'object' && 'toDate' in data.created_at) {
          createdAtStr = (data.created_at as { toDate: () => Date }).toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdAtStr = data.createdAt;
        } else if (typeof data.created_at === 'string') {
          createdAtStr = data.created_at;
        }

        return {
          id: d.id,
          title: data.title || 'Untitled Song',
          category: data.category || 'General',
          voicePart: data.voicePart || data.voice_part || 'All',
          fileUrl: data.fileUrl || data.file_url || '',
          fileType: data.fileType || data.file_type || (data.fileUrl?.endsWith('.pdf') ? 'pdf' : 'image'),
          pageCount: typeof data.pageCount === 'number' ? data.pageCount : (typeof data.page_count === 'number' ? data.page_count : null),
          pages: Array.isArray(data.pages) ? data.pages : null,
          storagePath: data.storagePath || data.storage_path || null,
          fileSize: data.fileSize || data.file_size || null,
          fileName: data.fileName || data.file_name || null,
          uploadedBy: data.uploadedBy || data.uploaded_by || null,
          uploaderName: data.uploaderName || data.uploader_name || null,
          createdAt: createdAtStr,
          notes: data.notes || null,
        };
      });

      // Sort by createdAt descending
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      cb(list);
    },
    (err) => {
      console.warn('Songs subscription warning:', err);
      cb([]);
    }
  );
}

export async function uploadSongFile(file: File): Promise<{
  fileUrl: string;
  storagePath: string;
  fileType: 'pdf' | 'image';
  fileName: string;
  fileSize: number;
}> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const fileType: 'pdf' | 'image' = isPdf ? 'pdf' : 'image';

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'soaca_preset');

    const res = await fetch('https://api.cloudinary.com/v1_1/lkeq71fq/auto/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data && data.secure_url) {
      return {
        fileUrl: data.secure_url,
        storagePath: data.public_id || '',
        fileType,
        fileName: file.name,
        fileSize: file.size,
      };
    }

    throw new Error(data?.error?.message || 'Cloudinary did not return a valid secure URL.');
  } catch (err) {
    console.error('Cloudinary file upload error:', err);
    const msg = err instanceof Error ? err.message : 'Upload to Cloudinary failed.';
    throw new Error(`Upload failed: ${msg}`);
  }
}

export async function addSong(songData: {
  title: string;
  category: string;
  voicePart: string;
  fileUrl: string;
  fileType: 'pdf' | 'image';
  pageCount?: number | null;
  pages?: string[] | null;
  storagePath?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  uploadedBy?: string | null;
  uploaderName?: string | null;
  notes?: string | null;
}): Promise<string> {
  // Guard against raw Base64 data URLs that exceed Firestore's 1MB document limit
  if (songData.fileUrl.startsWith('data:')) {
    throw new Error(
      'Cannot save base64 data to Firestore. The score sheet must be uploaded to Cloudinary to get a secure URL.'
    );
  }

  const docRef = await addDoc(songsCol, {
    title: songData.title.trim(),
    category: songData.category || 'General',
    voicePart: songData.voicePart || 'All',
    fileUrl: songData.fileUrl,
    fileType: songData.fileType,
    pageCount: songData.pageCount ?? null,
    pages: songData.pages ?? null,
    storagePath: songData.storagePath || null,
    fileName: songData.fileName || null,
    fileSize: songData.fileSize || null,
    uploadedBy: songData.uploadedBy || auth.currentUser?.uid || null,
    uploaderName: songData.uploaderName || null,
    notes: songData.notes || null,
    createdAt: serverTimestamp(),
    created_at: new Date().toISOString(),
  });
  return docRef.id;
}

export async function deleteSong(songId: string, storagePath?: string | null): Promise<void> {
  // Retain storagePath parameter for backwards compatibility with existing UI callers
  void storagePath;
  // Delete directly from Firestore document (no Firebase Storage dependency)
  await deleteDoc(doc(db, 'songs', songId));
}

const LOCAL_QUIZ_SCORES_KEY = 'soaca_quiz_scores_cache_v1';

export function getLocalQuizScores(): QuizScore[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_QUIZ_SCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any seed/demo scores
      const realScores = parsed.filter(
        (s) =>
          s &&
          !String(s.id).startsWith('seed-') &&
          !String(s.userId).startsWith('seed-') &&
          !String(s.userEmail || '').includes('@staugustine.org') &&
          !String(s.userName || '').includes('Mary Claire Nwosu')
      );
      if (realScores.length !== parsed.length) {
        localStorage.setItem(LOCAL_QUIZ_SCORES_KEY, JSON.stringify(realScores));
      }
      return realScores;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalQuizScores(scores: QuizScore[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanScores = scores.filter(
      (s) =>
        s &&
        !String(s.id).startsWith('seed-') &&
        !String(s.userId).startsWith('seed-') &&
        !String(s.userEmail || '').includes('@staugustine.org') &&
        !String(s.userName || '').includes('Mary Claire Nwosu')
    );
    localStorage.setItem(LOCAL_QUIZ_SCORES_KEY, JSON.stringify(cleanScores));
    window.dispatchEvent(new CustomEvent('soaca_quiz_scores_updated', { detail: cleanScores }));
  } catch (err) {
    console.warn('[QuizScores] Failed to save scores to localStorage:', err);
  }
}

export async function recordQuizScore(params: {
  score: number;
  totalQuestions?: number;
  timeTakenSeconds?: number;
  member?: Partial<Member> | null;
}): Promise<string> {
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid || `guest_${Date.now()}`;
  const total = params.totalQuestions ?? 10;
  const percentage = Math.round((params.score / total) * 100);
  const dateKey = getTodayDateKey();
  const nowIso = new Date().toISOString();
  const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  let name = currentUser?.displayName || 'Choir Member';
  let photo = currentUser?.photoURL || null;
  let voice: string | null = null;
  let email = currentUser?.email || null;

  if (params.member) {
    if (params.member.first_name || params.member.last_name) {
      name = `${params.member.first_name || ''} ${params.member.last_name || ''}`.trim() || name;
    }
    if (params.member.photoURL) photo = params.member.photoURL;
    if (params.member.voice_part) voice = params.member.voice_part;
    if (params.member.email) email = params.member.email;
  }

  const newScoreItem: QuizScore = {
    id: localId,
    userId: uid,
    userName: name,
    userEmail: email,
    userPhoto: photo,
    voicePart: voice,
    score: params.score,
    totalQuestions: total,
    percentage,
    dateKey,
    timeTakenSeconds: params.timeTakenSeconds,
    createdAt: nowIso,
  };

  // 1. Immediately record in local storage and broadcast
  const currentScores = getLocalQuizScores();
  const updatedScores = [newScoreItem, ...currentScores.filter((s) => s.id !== localId)];
  saveLocalQuizScores(updatedScores);

  // 2. Attempt remote Firestore persistence if accessible
  try {
    const docRef = await addDoc(quizScoresCol, {
      userId: uid,
      userName: name,
      userEmail: email,
      userPhoto: photo,
      voicePart: voice,
      score: params.score,
      totalQuestions: total,
      percentage,
      dateKey,
      timeTakenSeconds: params.timeTakenSeconds ?? null,
      createdAt: serverTimestamp(),
      created_at: nowIso,
    });
    return docRef.id;
  } catch (firestoreErr) {
    // If Firestore rules or offline prevents remote save, gracefully log warning and retain local score
    console.warn('[QuizScores] Firestore remote write unavailable, score securely saved locally:', firestoreErr);
    return localId;
  }
}

export function subscribeToQuizScores(cb: (scores: QuizScore[]) => void): () => void {
  // 1. Immediately emit active local/cached scores
  const initialScores = getLocalQuizScores();
  cb(initialScores);

  // 2. Listen to local updates from other components/tabs
  const handleLocalUpdate = () => {
    cb(getLocalQuizScores());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('soaca_quiz_scores_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);
  }

  // 3. Listen to Firestore collection in background with resilient error handling
  let unsubscribeFirestore = () => {};
  try {
    unsubscribeFirestore = onSnapshot(
      query(quizScoresCol),
      (snap) => {
        if (!snap || snap.empty) {
          cb(getLocalQuizScores());
          return;
        }

        const remoteList: QuizScore[] = snap.docs
          .map((d) => {
            const data = d.data();
            let createdAtStr = new Date().toISOString();
            if (data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt) {
              createdAtStr = (data.createdAt as { toDate: () => Date }).toDate().toISOString();
            } else if (typeof data.created_at === 'string') {
              createdAtStr = data.created_at;
            }

            return {
              id: d.id,
              userId: data.userId || '',
              userName: data.userName || 'Choir Member',
              userEmail: data.userEmail || null,
              userPhoto: data.userPhoto || null,
              voicePart: data.voicePart || null,
              score: typeof data.score === 'number' ? data.score : 0,
              totalQuestions: typeof data.totalQuestions === 'number' ? data.totalQuestions : 10,
              percentage: typeof data.percentage === 'number' ? data.percentage : 0,
              dateKey: data.dateKey || (createdAtStr ? createdAtStr.split('T')[0] : getTodayDateKey()),
              timeTakenSeconds: typeof data.timeTakenSeconds === 'number' ? data.timeTakenSeconds : undefined,
              createdAt: createdAtStr,
            };
          })
          .filter(
            (s) =>
              !String(s.id).startsWith('seed-') &&
              !String(s.userId).startsWith('seed-') &&
              !String(s.userEmail || '').includes('@staugustine.org') &&
              !String(s.userName || '').includes('Mary Claire Nwosu')
          );

        // Merge remote scores with any local unique scores
        const localItems = getLocalQuizScores();
        const mergedMap = new Map<string, QuizScore>();

        remoteList.forEach((r) => mergedMap.set(r.id, r));
        localItems.forEach((l) => {
          if (!mergedMap.has(l.id)) {
            mergedMap.set(l.id, l);
          }
        });

        const mergedList = Array.from(mergedMap.values());
        saveLocalQuizScores(mergedList);
        cb(mergedList);
      },
      (err) => {
        // Silently fall back to cached local storage scores without breaking or console erroring
        console.warn('[QuizScores] Firestore subscription in local fallback mode:', err?.message || 'Access restricted');
        cb(getLocalQuizScores());
      }
    );
  } catch (initErr) {
    console.warn('[QuizScores] Firestore query init error:', initErr);
    cb(getLocalQuizScores());
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('soaca_quiz_scores_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    }
    unsubscribeFirestore();
  };
}

import type { DailyMusicGuru, GuruProfile, ReigningGuruData } from '@/types';

/**
 * Helper to enrich a quiz score with latest profile details from choir members
 */
function enrichGuruProfile(
  scoreItem: QuizScore,
  members: Member[],
  isToday: boolean,
  isYesterday: boolean
): GuruProfile {
  const matchingMember = members.find(
    (m) =>
      (scoreItem.userId && (m.id === scoreItem.userId || m.uid === scoreItem.userId)) ||
      (scoreItem.userEmail && m.email && m.email.trim().toLowerCase() === scoreItem.userEmail.trim().toLowerCase())
  );

  let finalName = scoreItem.userName;
  let finalPhoto = scoreItem.userPhoto;
  let finalVoice = scoreItem.voicePart;

  if (matchingMember) {
    const memberFullName = `${matchingMember.first_name || ''} ${matchingMember.last_name || ''}`.trim();
    if (memberFullName) finalName = memberFullName;
    if (matchingMember.photoURL) finalPhoto = matchingMember.photoURL;
    if (matchingMember.voice_part) finalVoice = matchingMember.voice_part;
  }

  return {
    userId: scoreItem.userId,
    userName: finalName,
    userPhoto: finalPhoto,
    voicePart: finalVoice,
    score: scoreItem.score,
    totalQuestions: scoreItem.totalQuestions || 10,
    percentage: scoreItem.percentage || Math.round((scoreItem.score / (scoreItem.totalQuestions || 10)) * 100),
    dateKey: scoreItem.dateKey,
    dateLabel: isToday ? 'Today' : formatQuizDateKeyLabel(scoreItem.dateKey),
    isToday,
    isYesterday,
    achievedAt: scoreItem.createdAt,
    timeTakenSeconds: scoreItem.timeTakenSeconds,
  };
}

/**
 * Extracts all top scorers for a specific day.
 * If there is a tie / tally for the top score, crowns all tied participants!
 */
function getTopScorersForDay(
  dayScores: QuizScore[],
  members: Member[],
  isToday: boolean,
  isYesterday: boolean
): GuruProfile[] {
  if (!dayScores || dayScores.length === 0) return [];

  // Find max score achieved on that day (even 1/10 = 10% qualifies if it's the highest)
  const maxScore = Math.max(...dayScores.map((s) => s.score));
  const topAttempts = dayScores.filter((s) => s.score === maxScore);

  // Group by unique user
  const uniqueUserMap = new Map<string, QuizScore>();
  for (const attempt of topAttempts) {
    const userKey = attempt.userId || attempt.userEmail || attempt.userName;
    const existing = uniqueUserMap.get(userKey);
    if (!existing) {
      uniqueUserMap.set(userKey, attempt);
    } else {
      const existingTime = existing.timeTakenSeconds ?? 999999;
      const attemptTime = attempt.timeTakenSeconds ?? 999999;
      if (attemptTime < existingTime) {
        uniqueUserMap.set(userKey, attempt);
      }
    }
  }

  const uniqueScores = Array.from(uniqueUserMap.values());
  return uniqueScores.map((s) => enrichGuruProfile(s, members, isToday, isYesterday));
}

/**
 * Derives comprehensive Reigning Music Guru data:
 * - Each new day is refreshed so any member taking the quiz (even 1/10 = 10%) is crowned today's Music Guru.
 * - If there is a tie / tally for top score on the day, crowns all tied participants as Joint Music Gurus!
 * - If no one has played yet on the new day, provides the previous reigning guru details.
 */
export function getReigningMusicGuruData(
  scores: QuizScore[],
  members: Member[] = [],
  referenceDateKey?: string
): ReigningGuruData {
  let todayKey: string;
  let yesterdayKey: string;

  if (referenceDateKey && /^\d{4}-\d{2}-\d{2}$/.test(referenceDateKey)) {
    todayKey = referenceDateKey;
    const [y, m, d] = referenceDateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    yesterdayKey = getTodayDateKey(dateObj);
  } else {
    todayKey = getTodayDateKey();
    yesterdayKey = getYesterdayDateKey();
  }

  // 1. Check if we have scores recorded today
  const todayScores = scores.filter((s) => s.dateKey === todayKey);

  // 2. Find previous scores (from prior days)
  const pastScores = scores.filter((s) => s.dateKey !== todayKey);
  let previousGurus: GuruProfile[] = [];
  if (pastScores.length > 0) {
    const sortedDateKeys = Array.from(new Set(pastScores.map((s) => s.dateKey))).sort().reverse();
    const latestPastDateKey = sortedDateKeys[0];
    const prevDayScores = pastScores.filter((s) => s.dateKey === latestPastDateKey);
    previousGurus = getTopScorersForDay(prevDayScores, members, false, latestPastDateKey === yesterdayKey);
  }

  const previousGuru = previousGurus[0] || null;

  if (todayScores.length > 0) {
    // Today has participants!
    const todayGurus = getTopScorersForDay(todayScores, members, true, false);
    const topScore = todayGurus[0]?.score || 0;
    const percentage = todayGurus[0]?.percentage || 0;

    return {
      hasTodayGuru: true,
      isTie: todayGurus.length > 1,
      todayGurus,
      topScore,
      percentage,
      dateKey: todayKey,
      dateLabel: 'Today',
      previousGuru,
      previousGurus,
    };
  }

  // No participants yet today on the refreshed day
  return {
    hasTodayGuru: false,
    isTie: false,
    todayGurus: [],
    topScore: 0,
    percentage: 0,
    dateKey: todayKey,
    dateLabel: 'Today',
    previousGuru,
    previousGurus,
  };
}

/**
 * Backwards-compatible helper returning the active DailyMusicGuru (or previous champion if no new record today)
 */
export function getYesterdayMusicGuru(
  scores: QuizScore[],
  members: Member[] = [],
  referenceDateKey?: string
): DailyMusicGuru | null {
  const data = getReigningMusicGuruData(scores, members, referenceDateKey);
  if (data.hasTodayGuru && data.todayGurus.length > 0) {
    const primary = data.todayGurus[0];
    return {
      ...primary,
      tiedGurus: data.todayGurus.length > 1 ? data.todayGurus : undefined,
    };
  }
  if (data.previousGuru) {
    return {
      ...data.previousGuru,
      tiedGurus: data.previousGurus.length > 1 ? data.previousGurus : undefined,
    };
  }
  return null;
}

export async function logActivity(activity: Omit<ActivityLog, 'id'>): Promise<string> {
  try {
    const payload = {
      ...activity,
      timestamp: activity.timestamp || new Date().toISOString(),
    };
    const docRef = await addDoc(activityLogsCol, payload);
    return docRef.id;
  } catch (err) {
    console.warn('Failed to record activity log:', err);
    return '';
  }
}

export function subscribeToActivityLogs(
  cb: (logs: ActivityLog[]) => void,
  maxEntries: number = 150
): () => void {
  const q = query(activityLogsCol, orderBy('timestamp', 'desc'), limit(maxEntries));
  return onSnapshot(
    q,
    (snap) => {
      const logs: ActivityLog[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          type: (data.type as ActivityType) || 'manual_log',
          actor_id: data.actor_id || null,
          actor_name: data.actor_name || null,
          actor_email: data.actor_email || null,
          actor_role: data.actor_role || null,
          target_id: data.target_id || null,
          target_name: data.target_name || null,
          action: data.action || 'Activity recorded',
          details: (data.details as Record<string, unknown>) || null,
          timestamp: data.timestamp || new Date().toISOString(),
        };
      });
      cb(logs);
    },
    (err) => {
      console.warn('Error subscribing to activity logs:', err);
    }
  );
}

export function synthesizeHistoricalActivities(
  members: Member[],
  payments: DuesPayment[],
  periods: DuesPeriod[],
  songs: Song[],
  quizScores: QuizScore[] = []
): ActivityLog[] {
  const list: ActivityLog[] = [];
  const memberMap = new Map<string, Member>();
  for (const m of members) {
    if (m.id) memberMap.set(m.id, m);
    if (m.uid) memberMap.set(m.uid, m);
    if (m.user_id) memberMap.set(m.user_id, m);
    if (m.email) memberMap.set(m.email.toLowerCase(), m);
  }
  const periodMap = new Map<string, DuesPeriod>();
  for (const p of periods) {
    periodMap.set(p.id, p);
  }

  // 1. Members joined/registered
  for (const m of members) {
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Choir Member';
    const time = m.created_at || (m.join_date ? `${m.join_date}T10:00:00.000Z` : '2026-01-01T00:00:00.000Z');
    list.push({
      id: `synth-member-${m.id}`,
      type: 'member_registered',
      actor_id: m.id,
      actor_name: fullName,
      actor_email: m.email,
      actor_role: m.role || 'Member',
      target_id: m.id,
      target_name: fullName,
      action: `${fullName} joined the choir roster as ${m.voice_part}`,
      details: {
        voice_part: m.voice_part,
        role: m.role,
        status: m.status,
        phone: m.phone,
        join_date: m.join_date,
      },
      timestamp: time,
    });
  }

  // 2. Payments recorded
  for (const p of payments) {
    const mId = p.member_id || p.memberId;
    const m = mId ? memberMap.get(mId) : undefined;
    const mName = m ? `${m.first_name} ${m.last_name}`.trim() : 'Choir Member';
    const period = p.period_id ? periodMap.get(p.period_id) : undefined;
    const pName = period ? period.name : 'Dues Period';
    const amount = Number(p.amount_paid ?? p.amountPaid ?? 0);
    const time = p.created_at || (p.payment_date ? `${p.payment_date}T12:00:00.000Z` : new Date().toISOString());

    list.push({
      id: `synth-payment-${p.id}`,
      type: 'payment_recorded',
      actor_id: mId || null,
      actor_name: mName,
      actor_role: m?.role || 'Member',
      target_id: p.id,
      target_name: mName,
      action: `Dues payment of ₦${amount.toLocaleString()} recorded for ${mName} (${pName})`,
      details: {
        amount_paid: amount,
        status: p.status,
        payment_method: p.payment_method,
        period_name: pName,
        payment_date: p.payment_date,
      },
      timestamp: time,
    });
  }

  // 3. Songs uploaded
  for (const s of songs) {
    const time = s.createdAt || new Date().toISOString();
    list.push({
      id: `synth-song-${s.id}`,
      type: 'song_uploaded',
      actor_name: s.uploaderName || 'Choir Director',
      target_id: s.id,
      target_name: s.title,
      action: `Uploaded sheet music: "${s.title}" (${s.category}, ${s.voicePart})`,
      details: {
        category: s.category,
        voice_part: s.voicePart,
        file_name: s.fileName,
      },
      timestamp: time,
    });
  }

  // 4. Quiz scores
  for (const q of quizScores) {
    const time = q.createdAt || new Date().toISOString();
    list.push({
      id: `synth-quiz-${q.id}`,
      type: 'quiz_completed',
      actor_id: q.userId,
      actor_name: q.userName || 'Choir Member',
      target_id: q.id,
      action: `${q.userName} completed the Daily Music Quiz (${q.score}/${q.totalQuestions || 5} • ${q.percentage}%)`,
      details: {
        score: q.score,
        total_questions: q.totalQuestions,
        percentage: q.percentage,
        date_key: q.dateKey,
      },
      timestamp: time,
    });
  }

  // 5. Periods
  for (const pr of periods) {
    const time = pr.created_at || new Date().toISOString();
    list.push({
      id: `synth-period-${pr.id}`,
      type: 'period_created',
      actor_name: 'Choir Admin',
      target_id: pr.id,
      target_name: pr.name,
      action: `Created dues period "${pr.name}" (Due: ₦${pr.amount.toLocaleString()})`,
      details: {
        amount: pr.amount,
        due_date: pr.due_date,
        is_active: pr.is_active,
      },
      timestamp: time,
    });
  }

  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}



