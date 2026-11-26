'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { appStore } from '@/lib/store';
import { AuthSession, Course, Student } from '@/lib/types';
import ModalDialog from '@/components/common/ModalDialog';
import {
  BookOpen,
  Calendar,
  CalendarDays,
  Clock,
  Layers,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  GraduationCap,
  Sparkles,
  Home,
  Bell,
  ChevronRight,
  Settings,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  User,
  Search,
} from 'lucide-react';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeSemester, setActiveSemester] = useState<number>(3);
  const [showWeeklyScheduleModal, setShowWeeklyScheduleModal] = useState(false);
  const [scheduleDayFilter, setScheduleDayFilter] = useState<string>('all');
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasPjRole, setHasPjRole] = useState(false);

  // Settings & Nickname State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'NICKNAME' | 'PIN'>('NICKNAME');
  const [nicknameInput, setNicknameInput] = useState('');
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [settingsNotice, setSettingsNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [displayedNickname, setDisplayedNickname] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const openWeeklyHandler = () => setShowWeeklyScheduleModal(true);
    window.addEventListener('open-weekly-schedule', openWeeklyHandler);
    return () => window.removeEventListener('open-weekly-schedule', openWeeklyHandler);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const currentAuth = appStore.getAuth();
      setAuth(currentAuth);
      const allCourses = appStore.getCourses();
      setCourses(allCourses);
      setStudents(appStore.getStudents());
      setActiveSemester(appStore.getActiveSemester());

      if (currentAuth?.nim) {
        const cleanUserNim = (currentAuth.nim || '').trim();
        const isPj = (allCourses || []).some((c) =>
          Array.isArray(c?.pjNims) && c.pjNims.some((pNim) => (pNim || '').trim() === cleanUserNim)
        );
        setHasPjRole(isPj);
        const nick = appStore.getStudentNickname(cleanUserNim);
        const defaultNick = (currentAuth.name || 'User').split(' ')[0];
        setDisplayedNickname(nick || defaultNick);
        if (!nicknameInput) setNicknameInput(nick || defaultNick);
      } else if (currentAuth) {
        setHasPjRole(false);
        setDisplayedNickname('Admin');
        if (!nicknameInput) setNicknameInput('Admin');
      } else {
        setHasPjRole(false);
        setDisplayedNickname('');
      }
    };

    checkAuth();
    const unsubscribe = appStore.subscribe(checkAuth);
    return () => unsubscribe();
  }, [pathname]);

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !auth.nim) return;
    const cleanNick = nicknameInput.trim();
    if (!cleanNick) {
      setSettingsNotice({ type: 'error', text: 'Nama panggilan tidak boleh kosong.' });
      return;
    }
    appStore.setStudentNickname(auth.nim, cleanNick);
    setDisplayedNickname(cleanNick);
    setSettingsNotice({ type: 'success', text: `Nama panggilan berhasil diubah menjadi "${cleanNick}"!` });
    setTimeout(() => {
      setSettingsNotice(null);
    }, 2000);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !auth.nim) return;
    const student = students.find((s) => (s.nim || '').trim() === (auth.nim || '').trim());
    if (student?.pin && oldPinInput.trim() !== student.pin.trim()) {
      setSettingsNotice({ type: 'error', text: 'PIN lama yang Anda masukkan salah.' });
      return;
    }
    if (!/^\d{6}$/.test(newPinInput.trim())) {
      setSettingsNotice({ type: 'error', text: 'PIN baru harus tepat 6 digit angka.' });
      return;
    }
    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setSettingsNotice({ type: 'error', text: 'Konfirmasi PIN baru tidak cocok.' });
      return;
    }

    appStore.setStudentPin(auth.nim, newPinInput.trim());
    setSettingsNotice({ type: 'success', text: 'PIN keamanan 6 digit berhasil diperbarui!' });
    setOldPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setTimeout(() => {
      setSettingsNotice(null);
    }, 2000);
  };

  const getPjNames = (pjNims?: string[]) => {
    if (!pjNims || pjNims.length === 0) return 'Belum ditentukan';
    return pjNims
      .map((nim) => {
        const s = students.find((st) => st.nim === nim);
        return s ? s.name : nim;
      })
      .join(', ');
  };

  const handleLogout = () => {
    appStore.setAuth(null);
    setAuth(null);
    router.replace('/');
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 no-print">
      {/* Official University Portal Top Bar (#4A3200 Unified) */}
      <div className="bg-[#4A3200] text-white text-[11px] py-1.5 px-4 border-b border-[#362400]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#FCE4A6]">Fakultas Syariah</span>
            <span className="text-[#FCE4A6]/40">•</span>
            <span className="hidden sm:inline text-[#F6EFE0]">UIN Siber Syekh Nurjati Cirebon</span>
            <span className="hidden md:inline text-[#FCE4A6]/40">•</span>
            <span className="hidden md:inline text-[#F6EFE0]/80">Cyber Islamic University</span>
          </div>
          <div className="flex items-center space-x-2.5 text-[10px] font-semibold text-[#F6EFE0]">
            <span>Semester {activeSemester} ({activeSemester % 2 === 1 ? 'Ganjil' : 'Genap'})</span>
            <span className="hidden sm:inline bg-[#332200] px-2.5 py-0.5 rounded-full border border-[#C8962E]/40 text-[#FCE4A6]">
              Kelas A
            </span>
          </div>
        </div>
      </div>

      <nav className="bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5D7BC]/80 shadow-xs" aria-label="Utama">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px] py-2 gap-3">
          {/* Brand Logo & Full Name */}
          <Link href="/" replace className="flex items-center space-x-2.5 group flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-[#4A3200] border border-[#C8962E]/60 p-0.5 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo HK A 2025"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 leading-none">
                <span className="font-extrabold text-base text-[#241904] tracking-tight group-hover:text-[#4A3200] transition-colors">
                  HK A 2025
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F6EFE0] text-[#4A3200] border border-[#D7C49E]">
                  Syariah
                </span>
              </div>
              <p className="text-[11px] text-[#6B5730] font-medium tracking-tight mt-1 line-clamp-1">
                UIN Siber Syekh Nurjati Cirebon
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Clean, Spaced, No Search / No Kuliah Online) */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            <Link
              href="/"
              replace
              className={`px-3 py-1.5 rounded-xl text-xs lg:text-[13px] transition-all ${
                pathname === '/'
                  ? 'bg-[#F6EFE0] text-[#4A3200] font-bold border border-[#DFCCA6] shadow-2xs'
                  : 'font-medium text-[#5A4824] hover:text-[#4A3200] hover:bg-[#F6EFE0]/60'
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/#jadwal"
              className="px-3 py-1.5 rounded-xl text-xs lg:text-[13px] font-medium text-[#5A4824] hover:text-[#4A3200] hover:bg-[#F6EFE0]/60 transition-all"
            >
              Jadwal Kuliah
            </Link>
            <Link
              href="/#matakuliah"
              className="px-3 py-1.5 rounded-xl text-xs lg:text-[13px] font-medium text-[#5A4824] hover:text-[#4A3200] hover:bg-[#F6EFE0]/60 transition-all"
            >
              Mata Kuliah
            </Link>
            <button
              type="button"
              onClick={() => setShowWeeklyScheduleModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs lg:text-[13px] font-medium text-[#5A4824] hover:text-[#4A3200] hover:bg-[#F6EFE0]/60 transition-all"
            >
              Jadwal Seminggu
            </button>
            <Link
              href="/library"
              className={`px-3 py-1.5 rounded-xl text-xs lg:text-[13px] transition-all ${
                pathname.startsWith('/library')
                  ? 'bg-[#F6EFE0] text-[#4A3200] font-bold border border-[#DFCCA6] shadow-2xs'
                  : 'font-medium text-[#5A4824] hover:text-[#4A3200] hover:bg-[#F6EFE0]/60'
              }`}
            >
              E-Library
            </Link>
            <Link
              href="/#pengumuman"
              className="px-3 py-1.5 rounded-xl text-xs lg:text-[13px] font-medium text-[#5A4824] hover:text-[#4A3200] hover:bg-[#F6EFE0]/60 transition-all"
            >
              Pengumuman
            </Link>
          </div>

          {/* Desktop Right Action / Tactile 3D Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2.5 flex-shrink-0">
            {auth ? (
              <div className="flex items-center space-x-2.5">
                {auth.role === 'ADMIN' ? (
                  <Link
                    href="/admin"
                    className="btn-3d-bronze flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FCE4A6]" />
                    <span>Portal Admin</span>
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/mahasiswa"
                      className="btn-3d-cream flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#4A3200]" />
                      <span>Presensi Saya</span>
                    </Link>
                    {hasPjRole && (
                      <Link
                        href="/pj"
                        className="btn-3d-bronze flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#FCE4A6]" />
                        <span>Presensi PJ</span>
                      </Link>
                    )}
                  </div>
                )}

                {/* User Info & Actions Pill Group */}
                <div className="flex items-center pl-2.5 border-l border-[#E0D2B6] space-x-2">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#241904] leading-tight max-w-[120px] lg:max-w-[155px] truncate" title={auth.name}>
                      {displayedNickname || auth.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#7C673D] leading-none mt-0.5">
                      {auth.nim ? auth.nim : 'SUPERADMIN'}
                    </div>
                  </div>

                  <div className="flex items-center bg-[#F3E9D4] rounded-xl p-0.5 border border-[#DFCCA6]">
                    <button
                      type="button"
                      onClick={() => setShowSettingsModal(true)}
                      title="Pengaturan Akun"
                      aria-label="Pengaturan Akun"
                      className="p-1.5 rounded-lg text-[#5A4824] hover:text-[#4A3200] hover:bg-white transition-all"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Keluar / Logout"
                      aria-label="Keluar dari akun"
                      className="p-1.5 rounded-lg text-[#7C673D] hover:text-rose-600 hover:bg-white transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-3d-bronze flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-bold"
              >
                <LogIn className="w-3.5 h-3.5 text-[#FCE4A6]" />
                <span>Masuk Portal</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button & Tactile 3D Cream Nickname Pill */}
          <div className="flex md:hidden items-center space-x-2">
            {auth && (
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                title="Atur Nama Panggilan Badge Navbar"
                className="btn-3d-cream text-xs font-bold px-3 py-1.5 rounded-xl min-h-[36px]"
              >
                {displayedNickname || (auth.name || 'User').split(' ')[0]}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="btn-3d-cream min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#4A3200]"
              aria-label="Buka Menu Navigasi"
              title="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation Bar for Mobile (Inspired by Foto 3 Right Screen) */}
      {mounted && !pathname?.startsWith('/login') && createPortal(
        <nav
          aria-label="Navigasi Cepat Mobile"
          className="md:hidden fixed bottom-3 inset-x-3 z-40 no-print pointer-events-none flex justify-center"
        >
          <div className="pointer-events-auto w-full max-w-md bg-[#4A3200]/95 backdrop-blur-md text-white rounded-[24px] p-1.5 shadow-[0_12px_30px_rgba(38,25,0,0.42)] border border-[#7D580B]/70 grid grid-cols-4 gap-1">
            <Link
              href="/"
              replace
              className={`min-h-[48px] rounded-[18px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all ${
                pathname === '/'
                  ? 'bg-gradient-to-b from-[#FFFBF2] to-[#F3E4C6] text-[#4A3200] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_0_#C7B084]'
                  : 'text-[#F6EFE0]/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowWeeklyScheduleModal(true)}
              className={`min-h-[48px] rounded-[18px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all ${
                showWeeklyScheduleModal
                  ? 'bg-gradient-to-b from-[#FFFBF2] to-[#F3E4C6] text-[#4A3200] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_0_#C7B084]'
                  : 'text-[#F6EFE0]/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Jadwal</span>
            </button>

            <Link
              href="/library"
              className={`min-h-[48px] rounded-[18px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all ${
                pathname.startsWith('/library')
                  ? 'bg-gradient-to-b from-[#FFFBF2] to-[#F3E4C6] text-[#4A3200] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_0_#C7B084]'
                  : 'text-[#F6EFE0]/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>E-Library</span>
            </Link>

            <Link
              href={
                auth
                  ? auth.role === 'ADMIN'
                    ? '/admin'
                    : hasPjRole && pathname === '/mahasiswa'
                    ? '/pj'
                    : '/mahasiswa'
                  : '/login'
              }
              className={`min-h-[48px] rounded-[18px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all ${
                pathname.startsWith('/mahasiswa') || pathname.startsWith('/pj')
                  ? 'bg-gradient-to-b from-[#FFFBF2] to-[#F3E4C6] text-[#4A3200] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_0_#C7B084]'
                  : 'text-[#FCE4A6] hover:text-white hover:bg-white/10'
              }`}
            >
              {auth ? (
                auth.role === 'ADMIN' ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Presensi</span>
                  </>
                )
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </>
              )}
            </Link>
          </div>
        </nav>,
        document.body
      )}

      {/* Mobile Side Drawer (Right off-canvas, compact, #4A3200 harmonized) */}
      {mounted && isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[99999] md:hidden flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-[#1F1500]/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative z-10 w-72 sm:w-80 max-w-[84vw] h-full bg-[#FAF7F2] shadow-2xl rounded-l-3xl p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-[#DFCCA6]">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E5D7BC]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#4A3200] p-0.5 border border-[#C8962E]/60 flex-shrink-0">
                    <img src="/logo.png" alt="Logo HK A" className="w-full h-full object-contain rounded-xl" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#241904] text-xs">HK A 2025</h3>
                    <p className="text-[10px] text-[#6B5730] font-medium">UIN Siber Syekh Nurjati Cirebon</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Tutup Menu Navigasi"
                  className="btn-3d-cream min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-[#4A3200]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Session Profile Mini */}
              {auth && (
                <div className="my-3.5 p-3.5 rounded-2xl bg-[#4A3200] text-white border border-[#7D580B] flex items-center justify-between shadow-md">
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#FCE08B] to-[#D4A12A] text-[#3B2800] font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                      {auth.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate" title={auth.name}>
                        {auth.name}
                      </p>
                      <p className="text-[10px] text-[#FCE4A6]/85 font-mono">
                        {auth.nim ? `NIM: ${auth.nim}` : 'SUPERADMIN'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#332200] text-[#FCE4A6] border border-[#C8962E]/40 shrink-0">
                    {auth.role === 'ADMIN' ? 'Admin' : (hasPjRole ? 'PJ' : 'Mhs')}
                  </span>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex flex-col space-y-1.5 mt-2">
                <Link
                  href="/"
                  replace
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    pathname === '/'
                      ? 'bg-[#F6EFE0] text-[#4A3200] font-bold border border-[#DFCCA6]'
                      : 'text-[#4A3200]/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      pathname === '/' ? 'bg-[#4A3200] text-[#FCE4A6]' : 'bg-[#F3E9D4] text-[#4A3200]'
                    }`}>
                      <Home className="w-4 h-4" />
                    </div>
                    <span>Beranda</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C7549]" />
                </Link>

                <Link
                  href="/#pengumuman"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[#4A3200]/85 hover:bg-white text-xs font-semibold transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F3E9D4] text-[#4A3200] flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <span>Pengumuman Kelas</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C7549]" />
                </Link>

                {/* Portal Mahasiswa */}
                {auth && auth.role !== 'ADMIN' && (
                  <Link
                    href="/mahasiswa"
                    replace
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      pathname === '/mahasiswa'
                        ? 'bg-[#F6EFE0] text-[#4A3200] font-bold border border-[#DFCCA6]'
                        : 'text-[#4A3200]/85 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-[#F3E9D4] text-[#4A3200] flex items-center justify-center">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <span>Presensi Mahasiswa</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C7549]" />
                  </Link>
                )}

                {/* Portal PJ */}
                {hasPjRole && (
                  <Link
                    href="/pj"
                    replace
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      pathname === '/pj'
                        ? 'bg-[#F6EFE0] text-[#4A3200] font-bold border border-[#DFCCA6]'
                        : 'text-[#4A3200]/85 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-[#4A3200] text-[#FCE4A6] flex items-center justify-center shadow-2xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span>Portal PJ Presensi</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C7549]" />
                  </Link>
                )}

                {/* Portal Admin if admin */}
                {auth && auth.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    replace
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#4A3200] hover:bg-white"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-[#4A3200] text-[#FCE4A6] flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span>Portal Admin</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C7549]" />
                  </Link>
                )}

                {/* Pengaturan Akun */}
                {auth && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowSettingsModal(true);
                    }}
                    className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#4A3200] hover:bg-white text-left transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-[#F3E9D4] text-[#4A3200] flex items-center justify-center">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[#241904]">Pengaturan Akun</p>
                        <p className="text-[10px] text-[#6B5730] font-normal">Ganti PIN & Nama Panggilan</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C7549]" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Drawer Area (Logout or Login) */}
            <div className="pt-4 border-t border-[#E5D7BC] pb-16">
              {auth ? (
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  replace
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-3d-bronze flex items-center justify-center space-x-2 w-full py-3 rounded-2xl text-xs font-bold"
                >
                  <LogIn className="w-4 h-4 text-[#FCE4A6]" />
                  <span>Masuk Portal</span>
                </Link>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* POP-UP MODAL JADWAL KULIAH SEMINGGU (Native Accessible Dialog, #4A3200 + 3D) */}
      <ModalDialog
        open={mounted && showWeeklyScheduleModal}
        onClose={() => setShowWeeklyScheduleModal(false)}
        labelledBy="weekly-schedule-title"
        maxWidthClass="max-w-5xl"
      >
        {/* Modal Header (#4A3200 with curved bottom accent) */}
        <div className="bg-[#4A3200] text-white p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={() => setShowWeeklyScheduleModal(false)}
            className="btn-3d-cream absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 rounded-2xl flex items-center justify-center text-[#4A3200]"
            aria-label="Tutup Jadwal Mingguan"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5 pr-12">
            <div className="w-12 h-12 rounded-2xl bg-[#332200] p-1 border border-[#C8962E]/60 shadow-md flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Logo HK A" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#332200] border border-[#C8962E]/45 text-[#FCE4A6]">
                  Jadwal Kuliah Terpadu
                </span>
                <span className="text-xs text-[#F6EFE0]/85 font-medium hidden sm:inline">
                  Semester {activeSemester} ({activeSemester % 2 === 1 ? 'Ganjil' : 'Genap'})
                </span>
              </div>
              <h1 id="weekly-schedule-title" className="text-lg sm:text-2xl font-black tracking-tight text-white mt-1">
                Jadwal Kuliah Mingguan HK A
              </h1>
              <p className="text-xs text-[#F6EFE0]/80 mt-0.5 line-clamp-1">
                Fakultas Syariah • UIN Siber Syekh Nurjati Cirebon
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar Strip */}
        <div className="bg-[#FAF7F2] border-b border-[#E5D7BC] px-4 sm:px-6 py-3.5 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search Bar inside Schedule Modal */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8C7549] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={scheduleSearchQuery}
                onChange={(e) => setScheduleSearchQuery(e.target.value)}
                placeholder="Cari mata kuliah, dosen, ruang, atau PJ..."
                aria-label="Cari jadwal mata kuliah"
                className="w-full pl-9 pr-8 py-2 text-xs bg-white rounded-2xl border border-[#DFCCA6] text-[#241904] placeholder:text-[#9A855C] focus:border-[#4A3200] transition-all"
              />
              {scheduleSearchQuery && (
                <button
                  type="button"
                  onClick={() => setScheduleSearchQuery('')}
                  aria-label="Hapus kata kunci"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7549] hover:text-[#4A3200] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Summary Metric Badge */}
            <div className="flex items-center space-x-2 text-xs self-end sm:self-center">
              <span className="font-extrabold px-3.5 py-1.5 rounded-xl bg-[#F6EFE0] text-[#4A3200] border border-[#D7C49E]">
                {courses.length} Mata Kuliah • {courses.reduce((sum, c) => sum + (c.sks || 0), 0)} SKS
              </span>
            </div>
          </div>

          {/* 3D Day Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
            <button
              type="button"
              onClick={() => setScheduleDayFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
                scheduleDayFilter === 'all' ? 'btn-3d-bronze' : 'btn-3d-cream'
              }`}
            >
              Semua Hari ({courses.length} MK)
            </button>
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => {
              const dCount = (courses || []).filter((c) => (c?.day || '').toLowerCase() === d.toLowerCase()).length;
              const INDONESIAN_DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
              const todayDayName = INDONESIAN_DAY_NAMES[new Date().getDay()];
              const isToday = d.toLowerCase() === todayDayName.toLowerCase();
              const isSelected = scheduleDayFilter.toLowerCase() === d.toLowerCase();

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setScheduleDayFilter(d)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center space-x-1.5 ${
                    isSelected ? 'btn-3d-bronze' : 'btn-3d-cream'
                  }`}
                >
                  <span>{d}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-[#332200] text-[#FCE4A6] font-bold'
                        : 'bg-[#E8D9BA] text-[#4A3200]'
                    }`}
                  >
                    {dCount}
                  </span>
                  {isToday && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#FCE4A6]' : 'bg-emerald-600'} animate-pulse`}
                      title="Hari Ini"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Days & Courses */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAF7F2] flex-1">
          {(scheduleDayFilter === 'all' ? ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] : [scheduleDayFilter]).map((day) => {
            let dayCourses = (courses || []).filter((c) => (c?.day || '').toLowerCase() === day.toLowerCase());
            const INDONESIAN_DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const todayDayName = INDONESIAN_DAY_NAMES[new Date().getDay()];
            const isToday = day.toLowerCase() === todayDayName.toLowerCase();

            if (scheduleSearchQuery.trim()) {
              const q = scheduleSearchQuery.toLowerCase();
              dayCourses = dayCourses.filter(
                (c) =>
                  c.name.toLowerCase().includes(q) ||
                  c.code.toLowerCase().includes(q) ||
                  c.dosen.toLowerCase().includes(q) ||
                  c.room.toLowerCase().includes(q) ||
                  getPjNames(c.pjNims).toLowerCase().includes(q)
              );
            }

            const sortedCourses = [...dayCourses].sort((a, b) => {
              const parseMinutes = (timeStr: string) => {
                const match = (timeStr || '').match(/(\d{1,2}):(\d{2})/);
                if (!match) return 9999;
                return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
              };
              return parseMinutes(a.time) - parseMinutes(b.time);
            });

            const daySks = sortedCourses.reduce((acc, c) => acc + (c.sks || 0), 0);

            if (scheduleSearchQuery.trim() && sortedCourses.length === 0 && scheduleDayFilter === 'all') {
              return null;
            }

            return (
              <div
                key={day}
                className={`rounded-3xl p-4 sm:p-5 border space-y-3.5 transition-all ${
                  isToday
                    ? 'bg-white border-[#C8962E] shadow-md ring-2 ring-[#4A3200]/10'
                    : 'bg-white border-[#E5D7BC] shadow-2xs'
                }`}
              >
                {/* Day Header Banner */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F1E8D6]">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-xs ${
                        sortedCourses.length > 0
                          ? 'bg-[#4A3200] text-[#FCE4A6] shadow-[0_3px_0_#261900]'
                          : 'bg-[#F3E9D4] text-[#8C7549]'
                      }`}
                    >
                      {day.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="font-extrabold text-[#241904] text-base sm:text-lg tracking-tight">
                          {day}
                        </h2>
                        {isToday && (
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                            Hari Ini
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B5730] font-medium">
                        {sortedCourses.length > 0
                          ? `${sortedCourses.length} Mata Kuliah • Total ${daySks} SKS`
                          : day === 'Sabtu'
                          ? 'Libur Perkuliahan'
                          : 'Tidak Ada Jadwal Kuliah'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      sortedCourses.length > 0
                        ? 'bg-[#F6EFE0] text-[#4A3200] border border-[#D7C49E]'
                        : 'bg-[#F5F2EB] text-[#9A855C]'
                    }`}
                  >
                    {sortedCourses.length > 0 ? `${sortedCourses.length} MK` : 'Libur'}
                  </span>
                </div>

                {/* Course Cards Grid */}
                {sortedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {sortedCourses.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#FFFDF9] border border-[#E5D7BC] hover:border-[#4A3200]/50 transition-all flex flex-col justify-between space-y-3 group"
                      >
                        {/* Top Bar: Code & SKS (Left), Time (Right) */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#E8D9BA] text-[#4A3200]">
                              {c.code}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-[#4A3200] border border-[#DFCCA6]">
                              {c.sks} SKS
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-[#4A3200] bg-[#F6EFE0] border border-[#D7C49E] px-2.5 py-1 rounded-xl">
                            <Clock className="w-3.5 h-3.5 text-[#4A3200]" />
                            <span>{c.time.replace(' WIB', '')} WIB</span>
                          </div>
                        </div>

                        {/* Course Name & Dosen */}
                        <div className="flex items-start space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#4A3200] text-[#FCE4A6] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-[#241904] text-sm sm:text-[15px] tracking-tight leading-snug group-hover:text-[#4A3200] transition-colors">
                              {c.name}
                            </h3>
                            <p className="text-xs text-[#5A4824] mt-1 flex items-center space-x-1.5 font-medium">
                              <GraduationCap className="w-3.5 h-3.5 text-[#8C7549] shrink-0" />
                              <span className="truncate">{c.dosen}</span>
                            </p>
                          </div>
                        </div>

                        {/* Bottom Info: Room & PJ */}
                        <div className="pt-2.5 border-t border-[#E5D7BC]/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[160px]">{c.room}</span>
                          </div>

                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white text-[#4A3200] border border-[#DFCCA6] font-semibold text-[11px]">
                            <Users className="w-3.5 h-3.5 text-[#8C7549] shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[160px]">PJ: {getPjNames(c.pjNims)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-[#8C7549] italic">
                    {day === 'Sabtu'
                      ? 'Waktu istirahat / libur akhir pekan perkuliahan.'
                      : scheduleSearchQuery
                      ? 'Tidak ada mata kuliah yang cocok dengan kata kunci pencarian.'
                      : 'Tidak ada jadwal mata kuliah terjadwal pada hari ini.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-[#E5D7BC] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-[#6B5730] font-medium text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Waktu Indonesia Barat (WIB) • Jadwal dapat disesuaikan oleh Dosen Pengampu & PJ Kelas.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowWeeklyScheduleModal(false)}
            className="btn-3d-bronze w-full sm:w-auto px-6 py-2.5 rounded-2xl font-bold text-xs"
          >
            Tutup Jadwal
          </button>
        </div>
      </ModalDialog>

      {/* POP-UP MODAL PENGATURAN AKUN (NICKNAME & PIN) */}
      <ModalDialog
        open={mounted && showSettingsModal && Boolean(auth)}
        onClose={() => {
          setShowSettingsModal(false);
          setSettingsNotice(null);
        }}
        labelledBy="account-settings-title"
        maxWidthClass="max-w-md"
      >
        {auth && (
          <div className="overflow-y-auto flex-1">
            {/* Header (#4A3200) */}
            <div className="p-4 sm:p-5 bg-[#4A3200] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#FCE08B] to-[#D4A12A] text-[#3B2800] flex items-center justify-center shadow-xs">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h1 id="account-settings-title" className="font-extrabold text-sm text-white">
                    Pengaturan Akun
                  </h1>
                  <p className="text-[10px] text-[#FCE4A6]/90 font-medium">
                    Nama Panggilan & PIN Keamanan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  setSettingsNotice(null);
                }}
                aria-label="Tutup Pengaturan Akun"
                className="btn-3d-cream w-9 h-9 rounded-xl flex items-center justify-center text-[#4A3200]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alerts */}
            {settingsNotice && (
              <div
                role="status"
                aria-live="polite"
                className={`mx-4 mt-3 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  settingsNotice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {settingsNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-semibold">{settingsNotice.text}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="p-4 pb-0 flex border-b border-[#E5D7BC] bg-[#FAF7F2]">
              <button
                type="button"
                onClick={() => {
                  setSettingsTab('NICKNAME');
                  setSettingsNotice(null);
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all ${
                  settingsTab === 'NICKNAME'
                    ? 'border-[#4A3200] text-[#4A3200]'
                    : 'border-transparent text-[#8C7549] hover:text-[#4A3200]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Nama Badge Navbar HP</span>
              </button>
              {auth.nim && (
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab('PIN');
                    setSettingsNotice(null);
                  }}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all ${
                    settingsTab === 'PIN'
                      ? 'border-[#4A3200] text-[#4A3200]'
                      : 'border-transparent text-[#8C7549] hover:text-[#4A3200]'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Ganti PIN</span>
                </button>
              )}
            </div>

            {/* Form Body */}
            <div className="p-5 bg-white">
              {settingsTab === 'NICKNAME' ? (
                <form onSubmit={handleSaveNickname} className="space-y-4">
                  <div>
                    <span className="block text-[11px] font-bold text-[#4A3200] mb-1">
                      Nama Lengkap (Tetap Digunakan di Profil & Sidebar):
                    </span>
                    <p className="text-xs font-semibold text-[#241904] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#DFCCA6]">
                      {auth.name}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F6EFE0] text-[#4A3200] border border-[#DFCCA6] text-[11px] leading-relaxed">
                    <strong>Catatan:</strong> Pilihan nama di bawah hanya tampil pada <strong>badge Navbar HP</strong> agar hemat ruang. Di dalam <strong>sidebar menu</strong> dan <strong>desktop</strong> tetap nama lengkap resmi Anda.
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-[#4A3200] mb-1.5">
                      Pilih Kata Nama untuk Badge Navbar HP:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(auth.name || '')
                        .split(' ')
                        .filter(Boolean)
                        .map((word, idx) => {
                          const isSelected =
                            nicknameInput.trim().toLowerCase() === word.trim().toLowerCase();
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setNicknameInput(word)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                                isSelected ? 'btn-3d-bronze' : 'btn-3d-cream'
                              }`}
                            >
                              {word}
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="custom-nickname-input" className="block text-[11px] font-bold text-[#4A3200] mb-1">
                      Atau Ketik Nama Panggilan Kustom:
                    </label>
                    <input
                      id="custom-nickname-input"
                      type="text"
                      maxLength={15}
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value.replace(/\s+/g, ' '))}
                      placeholder="Contoh: Rizky"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D7C49E] focus:border-[#4A3200] font-bold text-[#241904]"
                    />
                    <p className="text-[10px] text-[#8C7549] mt-1">
                      Maksimal 15 karakter huruf/angka.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#DFCCA6] flex items-center justify-between">
                    <span className="text-xs font-medium text-[#5A4824]">
                      Pratinjau Badge Navbar:
                    </span>
                    <span className="btn-3d-cream text-xs font-bold px-3 py-1 rounded-xl">
                      {nicknameInput.trim() || 'Nama'}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setShowSettingsModal(false)}
                      className="btn-3d-cream px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn-3d-bronze px-5 py-2 rounded-xl text-xs font-bold"
                    >
                      Simpan Nama
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSavePin} className="space-y-3.5">
                  <p className="text-xs text-[#5A4824]">
                    Atur PIN keamanan 6 digit angka untuk akun mahasiswa Anda.
                  </p>

                  <div>
                    <label htmlFor="old-pin-input" className="block text-[11px] font-bold text-[#4A3200] mb-1">
                      PIN Lama (Jika Pernah Dibuat):
                    </label>
                    <input
                      id="old-pin-input"
                      type="password"
                      maxLength={6}
                      value={oldPinInput}
                      onChange={(e) => setOldPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="PIN 6 digit lama"
                      autoComplete="current-password"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#D7C49E] focus:border-[#4A3200]"
                    />
                  </div>

                  <div>
                    <label htmlFor="new-pin-input" className="block text-[11px] font-bold text-[#4A3200] mb-1">
                      PIN Baru (6 Digit Angka):
                    </label>
                    <input
                      id="new-pin-input"
                      type="password"
                      required
                      maxLength={6}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="6 angka baru (contoh: 123456)"
                      autoComplete="new-password"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#D7C49E] focus:border-[#4A3200]"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm-pin-input" className="block text-[11px] font-bold text-[#4A3200] mb-1">
                      Konfirmasi PIN Baru:
                    </label>
                    <input
                      id="confirm-pin-input"
                      type="password"
                      required
                      maxLength={6}
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ketik ulang 6 angka baru"
                      autoComplete="new-password"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#D7C49E] focus:border-[#4A3200]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setShowSettingsModal(false)}
                      className="btn-3d-cream px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn-3d-bronze px-5 py-2 rounded-xl text-xs font-bold"
                    >
                      Simpan PIN
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </ModalDialog>
      </nav>
    </header>
  );
}
