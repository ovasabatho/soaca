import { useEffect, useState, useMemo } from 'react';
import { signOut } from 'firebase/auth';
import { Menu } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import {
  subscribeToMembers,
  subscribeToPeriods,
  subscribeToPayments,
  addMember,
  createMemberWithAuth,
  updateMember,
  deleteMember,
  addPeriod,
  updatePeriod,
  deletePeriod,
  upsertPayment,
  clearPayment,
  subscribeToAnnouncement,
  subscribeToOrderOfMass,
  saveAnnouncement,
  saveOrderOfMass,
  subscribeToSongs,
  uploadSongFile,
  addSong,
  deleteSong,
  logActivity,
} from '@/lib/firestore';
import type { Member, DuesPeriod, DuesPayment, PaymentMethod, PaymentStatus, Announcement, OrderOfMass, MemberRole, Song } from '@/types';
import { canEditFinances, canViewFinances, isAdmin } from '@/lib/permissions';
import { Sidebar, type ViewName } from '@/components/Sidebar';
import { Watermark } from '@/components/Watermark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoginScreen } from '@/views/LoginScreen';
import { RegisterView } from '@/views/RegisterView';
import { Dashboard } from '@/views/Dashboard';
import { MembersView } from '@/views/MembersView';
import { PeriodsView } from '@/views/PeriodsView';
import { DuesView } from '@/views/DuesView';
import { SongLibraryView } from '@/views/SongLibraryView';
import { QuizView } from '@/views/QuizView';
import { ActivityLogView } from '@/views/ActivityLogView';
import { BirthdayPromptModal } from '@/components/BirthdayPromptModal';
import { isValidBirthday } from '@/lib/format';
import { OfflineIndicator } from '@/components/OfflineIndicator';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<ViewName>(() => {
    if (typeof window !== 'undefined') {
      const cleanPath = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
      if (
        cleanPath === 'members' ||
        cleanPath === 'periods' ||
        cleanPath === 'dues' ||
        cleanPath === 'songs' ||
        cleanPath === 'music' ||
        cleanPath === 'library' ||
        cleanPath === 'quiz' ||
        cleanPath === 'activity' ||
        cleanPath === 'activity-log' ||
        cleanPath === 'activities'
      ) {
        if (cleanPath === 'music' || cleanPath === 'library') return 'songs';
        if (cleanPath === 'activity-log' || cleanPath === 'activities') return 'activity';
        return cleanPath as ViewName;
      }
    }
    return 'dashboard';
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/register' || hash === '#register' || path.startsWith('/register')) {
        return 'register';
      }
    }
    return 'login';
  });

  // Listen to browser URL navigation (popstate & hashchange) and handle catch-all fallback routing
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const cleanPath = path.replace(/^\/+|\/+$/g, '');

      if (!user) {
        if (cleanPath === 'register' || hash === '#register') {
          setAuthScreen('register');
        } else if (cleanPath === 'login' || hash === '#login' || cleanPath === '') {
          setAuthScreen('login');
        } else {
          // Catch-all route for unauthenticated visitors: redirect unknown URLs to /login
          setAuthScreen('login');
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.history.replaceState(null, '', '/login');
          }
        }
      } else {
        // Authenticated user navigation
        if (
          cleanPath === 'members' ||
          cleanPath === 'periods' ||
          cleanPath === 'dues' ||
          cleanPath === 'songs' ||
          cleanPath === 'music' ||
          cleanPath === 'library' ||
          cleanPath === 'quiz' ||
          cleanPath === 'activity' ||
          cleanPath === 'activity-log' ||
          cleanPath === 'activities' ||
          cleanPath === 'dashboard'
        ) {
          if (cleanPath === 'music' || cleanPath === 'library') {
            setView('songs');
          } else if (cleanPath === 'activity-log' || cleanPath === 'activities') {
            setView('activity');
          } else {
            setView(cleanPath as ViewName);
          }
        } else if (cleanPath === '' || cleanPath === 'login' || cleanPath === 'register') {
          // Redirect login/register/root to /dashboard once logged in
          setView('dashboard');
          if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
            window.history.replaceState(null, '', '/dashboard');
          }
        } else {
          // Catch-all route for unknown URLs: fallback gracefully to /dashboard
          setView('dashboard');
          if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
            window.history.replaceState(null, '', '/dashboard');
          }
        }
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [user]);

  const navigateToRegister = () => {
    setAuthScreen('register');
    if (typeof window !== 'undefined' && window.location.pathname !== '/register') {
      window.history.pushState(null, '', '/register');
    }
  };

  const navigateToLogin = () => {
    setAuthScreen('login');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/login');
    }
  };

  const [members, setMembers] = useState<Member[]>([]);
  const [periods, setPeriods] = useState<DuesPeriod[]>([]);
  const [payments, setPayments] = useState<DuesPayment[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [orderOfMass, setOrderOfMass] = useState<OrderOfMass | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const currentMember = useMemo(() => {
    if (!user) return undefined;
    const userEmail = user.email?.trim().toLowerCase();
    return members.find(
      (m) =>
        (m.id && m.id === user.uid) ||
        (m.uid && m.uid === user.uid) ||
        (m.user_id && m.user_id === user.uid) ||
        (m.email && userEmail && m.email.trim().toLowerCase() === userEmail)
    );
  }, [members, user]);

  const userRole: MemberRole = useMemo(() => {
    if (isAdmin(currentMember?.role, user?.email)) {
      return 'Admin';
    }
    return currentMember?.role ?? 'Member';
  }, [currentMember, user]);

  const currentMemberId = currentMember?.id ?? null;

  // Check if existing logged-in user needs to provide their birthdate (DD-MM)
  const showBirthdayPrompt = useMemo(() => {
    if (!user || authLoading || dataLoading) return false;
    if (currentMember) {
      return !currentMember.birthdate || !isValidBirthday(currentMember.birthdate);
    }
    // If data loaded and currentMember document hasn't been created yet, show prompt
    return true;
  }, [user, authLoading, dataLoading, currentMember]);

  // Ensure an Admin user has a matching member document with Admin role
  useEffect(() => {
    if (!user || dataLoading) return;
    const userEmail = user.email?.trim().toLowerCase();
    if (!userEmail) return;

    if (isAdmin(currentMember?.role, userEmail)) {
      const match = members.find(
        (m) => (m.email && m.email.trim().toLowerCase() === userEmail) || m.id === user.uid
      );
      if (!match) {
        addMember(
          {
            first_name: user.displayName?.split(' ')[0] || 'Admin',
            last_name: user.displayName?.split(' ').slice(1).join(' ') || 'User',
            email: user.email,
            phone: null,
            photoURL: user.photoURL || null,
            voice_part: 'Tenor',
            role: 'Admin',
            status: 'Active',
            join_date: new Date().toISOString().split('T')[0],
            notes: 'Choir Administrator',
            uid: user.uid,
            user_id: user.uid,
          },
          user.uid
        ).catch((err) => console.warn('Could not auto-create admin member profile:', err));
      } else if (match.role !== 'Admin') {
        updateMember(match.id, { role: 'Admin' }).catch((err) =>
          console.warn('Could not update admin member role:', err)
        );
      }
    }
  }, [user, dataLoading, members, currentMember]);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    const unsubMembers = subscribeToMembers((data) => {
      setMembers(data);
      setDataLoading(false);
    });
    const unsubPeriods = subscribeToPeriods(setPeriods);
    const unsubAnnouncement = subscribeToAnnouncement(setAnnouncement);
    const unsubOrder = subscribeToOrderOfMass(setOrderOfMass);
    const unsubSongs = subscribeToSongs(setSongs);
    return () => {
      unsubMembers();
      unsubPeriods();
      unsubAnnouncement();
      unsubOrder();
      unsubSongs();
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setPayments([]);
      return;
    }
    // Wait until members load so role and member ID can be evaluated
    if (dataLoading) return;

    const canViewAll = canViewFinances(userRole, user.email);
    const unsubPayments = subscribeToPayments(setPayments, {
      canViewAll,
      memberId: currentMemberId,
      userId: user.uid,
    });
    return () => {
      unsubPayments();
    };
  }, [user, dataLoading, userRole, currentMemberId]);

  // Log user login activity once per browser session
  useEffect(() => {
    if (!user || dataLoading) return;
    const sessionKey = `choir_session_logged_${user.uid}_${new Date().toISOString().split('T')[0]}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, 'true');
      const actorName = currentMember
        ? `${currentMember.first_name} ${currentMember.last_name}`
        : user.email || 'Choir Member';
      logActivity({
        type: 'login',
        actor_id: user.uid,
        actor_name: actorName,
        actor_email: user.email,
        actor_role: userRole,
        action: `${actorName} logged into Choir Portal`,
        timestamp: new Date().toISOString(),
      }).catch((err) => console.warn('Could not record login log:', err));
    }
  }, [user, dataLoading, currentMember, userRole]);

  const handleLogout = () => {
    signOut(auth);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
      </div>
    );
  }

  if (!user) {
    if (authScreen === 'register') {
      return (
        <>
          <RegisterView onNavigateToLogin={navigateToLogin} />
          <OfflineIndicator />
        </>
      );
    }
    return (
      <>
        <LoginScreen onNavigateToRegister={navigateToRegister} />
        <OfflineIndicator />
      </>
    );
  }

  const navigate = (v: ViewName) => {
    setView(v);
    setMobileNavOpen(false);
    if (typeof window !== 'undefined' && window.location.pathname !== `/${v}`) {
      window.history.pushState(null, '', `/${v}`);
    }
  };

  const activeMemberCount = members.filter((m) => m.status === 'Active').length;

  const handleAddMember = async (data: Omit<Member, 'id' | 'created_at'> & { password: string }) => {
    const { password, ...profile } = data;
    if (!profile.email) throw new Error('Email is required to create a member account');
    await createMemberWithAuth(profile.email, password, profile);
    const actorName = currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : user?.email || 'Admin';
    logActivity({
      type: 'member_created',
      actor_id: user?.uid,
      actor_name: actorName,
      actor_email: user?.email,
      actor_role: userRole,
      target_name: `${profile.first_name} ${profile.last_name}`,
      action: `${actorName} added new member ${profile.first_name} ${profile.last_name} (${profile.voice_part})`,
      details: {
        voice_part: profile.voice_part,
        role: profile.role,
        email: profile.email,
        phone: profile.phone,
      },
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleUpdateMember = async (id: string, data: Partial<Member>) => {
    const target = members.find((m) => m.id === id || m.uid === id);
    const targetName = target ? `${target.first_name} ${target.last_name}` : 'Member';
    const actorName = currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : user?.email || 'Admin';
    await updateMember(id, data);
    logActivity({
      type: 'member_updated',
      actor_id: user?.uid,
      actor_name: actorName,
      actor_email: user?.email,
      actor_role: userRole,
      target_id: id,
      target_name: targetName,
      action: `${actorName} updated profile details for ${targetName}`,
      details: data,
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleDeleteMember = async (id: string) => {
    const target = members.find((m) => m.id === id || m.uid === id);
    const targetName = target ? `${target.first_name} ${target.last_name}` : 'Member';
    const actorName = currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : user?.email || 'Admin';
    await deleteMember(id);
    logActivity({
      type: 'member_deleted',
      actor_id: user?.uid,
      actor_name: actorName,
      actor_email: user?.email,
      actor_role: userRole,
      target_id: id,
      target_name: targetName,
      action: `${actorName} removed member ${targetName} from the choir roster`,
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleSaveAnnouncement = async (title: string, content: string) => {
    const currentMemberObj = members.find((m) => m.email === user?.email);
    const updatedBy = currentMemberObj ? `${currentMemberObj.first_name} ${currentMemberObj.last_name}` : null;
    await saveAnnouncement(title, content, updatedBy);
    logActivity({
      type: 'announcement_updated',
      actor_id: user?.uid,
      actor_name: updatedBy || user?.email || 'Admin',
      actor_email: user?.email,
      actor_role: userRole,
      target_name: title,
      action: `Published notice: "${title}"`,
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleSaveOrderOfMass = async (title: string, content: string, massDate: string | null) => {
    const currentMemberObj = members.find((m) => m.email === user?.email);
    const updatedBy = currentMemberObj ? `${currentMemberObj.first_name} ${currentMemberObj.last_name}` : null;
    await saveOrderOfMass(title, content, massDate, updatedBy);
    logActivity({
      type: 'order_of_mass_updated',
      actor_id: user?.uid,
      actor_name: updatedBy || user?.email || 'Admin',
      actor_email: user?.email,
      actor_role: userRole,
      target_name: title,
      action: `Updated Order of Mass: "${title}" ${massDate ? `(${massDate})` : ''}`,
      details: { mass_date: massDate },
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleAddPeriod = async (data: Omit<DuesPeriod, 'id' | 'created_at'>) => {
    const id = await addPeriod(data);
    const actorName = currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : user?.email || 'Admin';
    logActivity({
      type: 'period_created',
      actor_id: user?.uid,
      actor_name: actorName,
      actor_email: user?.email,
      actor_role: userRole,
      target_id: id,
      target_name: data.name,
      action: `${actorName} created dues period "${data.name}" (₦${data.amount.toLocaleString()})`,
      details: { amount: data.amount, due_date: data.due_date },
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleUpdatePeriod = async (id: string, data: Partial<DuesPeriod>) => {
    await updatePeriod(id, data);
    const actorName = currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : user?.email || 'Admin';
    logActivity({
      type: 'period_updated',
      actor_id: user?.uid,
      actor_name: actorName,
      actor_email: user?.email,
      actor_role: userRole,
      target_id: id,
      target_name: data.name || 'Dues Period',
      action: `${actorName} updated dues period "${data.name || id}"`,
      details: data,
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleDeletePeriod = async (id: string) => {
    const period = periods.find((p) => p.id === id);
    const actorName = currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : user?.email || 'Admin';
    await deletePeriod(id);
    logActivity({
      type: 'period_deleted',
      actor_id: user?.uid,
      actor_name: actorName,
      actor_email: user?.email,
      actor_role: userRole,
      target_id: id,
      target_name: period?.name || 'Dues Period',
      action: `${actorName} deleted dues period "${period?.name || id}"`,
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleUpsertPayment = async (
    memberId: string,
    periodId: string,
    data: {
      amount_paid?: number;
      amountPaid?: number;
      memberId?: string;
      periodId?: string;
      payment_date?: string | null;
      paymentDate?: string | null;
      payment_method: PaymentMethod;
      status: PaymentStatus | string;
      reference_number: string;
      notes: string;
    }
  ) => {
    const existing = payments.find(
      (p) =>
        ((p.memberId && p.memberId === memberId) || (p.member_id && p.member_id === memberId)) &&
        ((p.periodId && p.periodId === periodId) || (p.period_id && p.period_id === periodId))
    );
    await upsertPayment(memberId, periodId, data, existing?.id);

    const member = members.find((m) => m.id === memberId || m.uid === memberId);
    const period = periods.find((p) => p.id === periodId);
    const memberName = member ? `${member.first_name} ${member.last_name}` : 'Choir Member';
    const periodName = period?.name || 'Dues Period';
    const amount = Number(data.amount_paid ?? data.amountPaid ?? 0);
    const actorName = currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : user?.email || 'Admin';

    logActivity({
      type: existing ? 'payment_updated' : 'payment_recorded',
      actor_id: user?.uid,
      actor_name: actorName,
      actor_email: user?.email,
      actor_role: userRole,
      target_id: memberId,
      target_name: memberName,
      action: `${actorName} recorded ${data.status} payment of ₦${amount.toLocaleString()} for ${memberName} (${periodName})`,
      details: {
        amount_paid: amount,
        status: data.status,
        payment_method: data.payment_method,
        period_name: periodName,
        reference_number: data.reference_number,
      },
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleClearPayment = async (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    const memberId = payment?.member_id || payment?.memberId;
    const member = memberId ? members.find((m) => m.id === memberId || m.uid === memberId) : undefined;
    const memberName = member ? `${member.first_name} ${member.last_name}` : 'Choir Member';
    const period = payment ? periods.find((pr) => pr.id === (payment.period_id || payment.periodId)) : undefined;
    const actorName = currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : user?.email || 'Admin';

    await clearPayment(paymentId);

    logActivity({
      type: 'payment_cleared',
      actor_id: user?.uid,
      actor_name: actorName,
      actor_email: user?.email,
      actor_role: userRole,
      target_id: paymentId,
      target_name: memberName,
      action: `${actorName} cleared payment record for ${memberName} (${period?.name || 'Dues Period'})`,
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleUploadSong = async (
    file: File,
    meta: {
      title: string;
      category: string;
      voicePart: string;
      notes?: string;
      fileUrl?: string;
      pageCount?: number | null;
      pages?: string[] | null;
    }
  ) => {
    let fileUrl = meta.fileUrl;
    let fileName = file.name;
    let fileSize = file.size;
    let storagePath = '';
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const fileType: 'pdf' | 'image' = isPdf ? 'pdf' : 'image';

    if (!fileUrl) {
      const uploadRes = await uploadSongFile(file);
      fileUrl = uploadRes.fileUrl;
      fileName = uploadRes.fileName;
      fileSize = uploadRes.fileSize;
      storagePath = uploadRes.storagePath;
    }

    if (!fileUrl || !fileUrl.startsWith('http')) {
      throw new Error('Upload failed: No valid cloud file URL received.');
    }

    const uploaderName = currentMember
      ? `${currentMember.first_name} ${currentMember.last_name}`
      : user?.displayName || user?.email || null;

    const newSongId = await addSong({
      title: meta.title,
      category: meta.category,
      voicePart: meta.voicePart,
      fileUrl,
      fileType,
      pageCount: meta.pageCount ?? null,
      pages: meta.pages ?? null,
      storagePath,
      fileName,
      fileSize,
      uploadedBy: user?.uid || null,
      uploaderName,
      notes: meta.notes || null,
    });

    const pageCountNote = meta.pageCount && meta.pageCount > 1 ? ` (${meta.pageCount} pages compiled)` : '';

    logActivity({
      type: 'song_uploaded',
      actor_id: user?.uid,
      actor_name: uploaderName || 'Choir Member',
      actor_email: user?.email,
      actor_role: userRole,
      target_id: newSongId,
      target_name: meta.title,
      action: `${uploaderName || 'Choir Member'} uploaded sheet music: "${meta.title}" (${meta.category}, ${meta.voicePart})${pageCountNote}`,
      details: {
        category: meta.category,
        voice_part: meta.voicePart,
        file_name: fileName,
        page_count: meta.pageCount,
      },
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleDeleteSong = async (id: string, storagePath?: string | null) => {
    const song = songs.find((s) => s.id === id);
    const actorName = currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : user?.email || 'Admin';
    await deleteSong(id, storagePath);

    logActivity({
      type: 'song_deleted',
      actor_id: user?.uid,
      actor_name: actorName,
      actor_email: user?.email,
      actor_role: userRole,
      target_id: id,
      target_name: song?.title || 'Sheet Music',
      action: `${actorName} deleted sheet music: "${song?.title || id}"`,
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  const handleSaveBirthday = async (birthdate: string) => {
    if (!user) return;
    const targetId = currentMember?.id || user.uid;
    const actorName = currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : user.displayName || 'Member';
    await updateMember(targetId, {
      birthdate,
      uid: user.uid,
      user_id: user.uid,
      email: user.email,
      first_name: currentMember?.first_name || user.displayName?.split(' ')[0] || 'Member',
      last_name: currentMember?.last_name || user.displayName?.split(' ').slice(1).join(' ') || '',
    });

    logActivity({
      type: 'member_updated',
      actor_id: user.uid,
      actor_name: actorName,
      actor_email: user.email,
      actor_role: userRole,
      target_id: targetId,
      target_name: actorName,
      action: `${actorName} updated their birthdate to ${birthdate}`,
      details: { birthdate },
      timestamp: new Date().toISOString(),
    }).catch(console.warn);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Watermark />

      <Sidebar
        current={view}
        onNavigate={navigate}
        memberCount={activeMemberCount}
        songCount={songs.length}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onLogout={handleLogout}
        userEmail={user.email}
        userRole={userRole}
      />

      <div className="lg:pl-64">
        <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm lg:hidden dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-semibold text-slate-900 dark:text-white">Choir Portal</span>
          </div>
          <ThemeToggle variant="compact" />
        </div>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {view === 'dashboard' && (
            <Dashboard
              members={members}
              periods={periods}
              payments={payments}
              loading={dataLoading}
              onNavigate={navigate}
              userEmail={user.email}
              announcement={announcement}
              orderOfMass={orderOfMass}
              onSaveAnnouncement={handleSaveAnnouncement}
              onSaveOrderOfMass={handleSaveOrderOfMass}
            />
          )}
          {view === 'songs' && (
            <SongLibraryView
              songs={songs}
              loading={dataLoading}
              userRole={userRole}
              userEmail={user.email}
              onUploadSong={handleUploadSong}
              onDeleteSong={handleDeleteSong}
            />
          )}
          {view === 'members' && (
            <MembersView
              members={members}
              loading={dataLoading}
              userRole={userRole}
              onAdd={handleAddMember}
              onUpdate={handleUpdateMember}
              onDelete={handleDeleteMember}
            />
          )}
          {view === 'periods' && canEditFinances(userRole, user?.email) && (
            <PeriodsView
              periods={periods}
              payments={payments}
              membersCount={activeMemberCount}
              loading={dataLoading}
              onAdd={handleAddPeriod}
              onUpdate={handleUpdatePeriod}
              onDelete={handleDeletePeriod}
            />
          )}
          {view === 'dues' && (
            <DuesView
              members={members}
              periods={periods}
              payments={payments}
              loading={dataLoading}
              userRole={userRole}
              userEmail={user?.email}
              currentMemberId={currentMemberId}
              onUpsertPayment={handleUpsertPayment}
              onClearPayment={handleClearPayment}
            />
          )}
          {view === 'quiz' && <QuizView currentMember={currentMember} />}
          {view === 'activity' && isAdmin(userRole, user?.email) && (
            <ActivityLogView
              members={members}
              periods={periods}
              payments={payments}
              songs={songs}
              userEmail={user.email}
              userName={currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : 'Admin'}
            />
          )}
        </main>
      </div>

      {/* Existing Member Birthday Prompt Modal (Non-dismissible until saved) */}
      <BirthdayPromptModal
        open={showBirthdayPrompt}
        userName={currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : user?.displayName || user?.email}
        onSave={handleSaveBirthday}
      />

      <OfflineIndicator />
    </div>
  );
}

export default App;
