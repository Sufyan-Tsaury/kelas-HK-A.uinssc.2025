'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  CalendarDays,
  GraduationCap,
  LogIn,
  Sparkles,
  Users,
  FileText,
  Bell,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Trash2,
  Download,
  Lock,
  User,
  Video,
  ExternalLink,
  X,
} from 'lucide-react';
import { appStore } from '@/lib/store';
import { Course, Announcement, Student, CourseMaterial, AuthSession } from '@/lib/types';
import { detectMeetingPlatform } from '@/lib/meetUtils';
import ModalDialog from '@/components/common/ModalDialog';
import CourseTileIcon from '@/components/common/CourseTileIcon';

// Lightweight animated counter component (pure JS requestAnimationFrame, 0 dependencies)
function AnimatedCounter({
  value,
  duration = 1400,
  prefix = '',
  suffix = '',
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animFrame: number;
    const target = Number(value) || 0;

    const updateCounter = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * target);
      setCount(current);

      if (progress < 1) {
        animFrame = requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    animFrame = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animFrame);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [activeSemester, setActiveSemester] = useState<number>(3);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showRosterModal, setShowRosterModal] = useState(false);

  // Direct File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showExitToast, setShowExitToast] = useState(false);

  // References for open modals to close them on back button press
  const selectedCourseRef = React.useRef(selectedCourse);
  const selectedAnnouncementRef = React.useRef(selectedAnnouncement);
  const showRosterModalRef = React.useRef(showRosterModal);

  useEffect(() => {
    selectedCourseRef.current = selectedCourse;
  }, [selectedCourse]);

  useEffect(() => {
    selectedAnnouncementRef.current = selectedAnnouncement;
  }, [selectedAnnouncement]);

  useEffect(() => {
    showRosterModalRef.current = showRosterModal;
  }, [showRosterModal]);

  // Mobile Back Button Guard: Close open modal first, or Double-Back to Exit Web App
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastBackPressTime = 0;

    // Push initial root guard state on mount
    window.history.pushState({ isHomeRoot: true }, '', window.location.pathname);

    const handlePopState = () => {
      // 1. If any modal is open, pressing back closes the modal smoothly
      if (selectedCourseRef.current || selectedAnnouncementRef.current || showRosterModalRef.current) {
        setSelectedCourse(null);
        setSelectedAnnouncement(null);
        setShowRosterModal(false);
        window.history.pushState({ isHomeRoot: true }, '', window.location.pathname);
        return;
      }

      // 2. If no modal is open: Double-Back to Exit
      const now = Date.now();
      if (now - lastBackPressTime < 2000) {
        window.history.go(-1);
      } else {
        lastBackPressTime = now;
        window.history.pushState({ isHomeRoot: true }, '', window.location.pathname);
        setShowExitToast(true);
        setTimeout(() => {
          setShowExitToast(false);
        }, 2000);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!auth) {
      alert('Akses Ditolak: Anda harus login sebagai Mahasiswa, PJ, atau Admin untuk mengunggah berkas.');
      e.target.value = '';
      return;
    }

    const file = e.target.files?.[0];
    if (!file || !selectedCourse) return;

    setIsUploading(true);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    const fileSizeStr = `${sizeInMb} MB`;
    const cleanFileName = file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      appStore.addMaterial({
        courseId: selectedCourse.id,
        title: cleanFileName,
        type: 'TUGAS',
        url: result,
        uploadedBy: auth?.role === 'ADMIN' ? 'Admin' : (auth?.name || 'Mahasiswa'),
        fileSize: fileSizeStr,
      });
      setIsUploading(false);
      showToast(`Berkas "${cleanFileName}" berhasil diunggah!`);
      e.target.value = '';
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert('Gagal membaca berkas. Silakan coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMaterial = (id: string, title: string) => {
    if (!auth) {
      alert('Akses Ditolak: Anda harus login untuk menghapus berkas.');
      return;
    }
    if (confirm(`Hapus berkas "${title}"? Tindakan ini akan menghapus berkas secara permanen.`)) {
      appStore.deleteMaterial(id);
      showToast(`Berkas "${title}" berhasil dihapus.`);
    }
  };

  useEffect(() => {
    const updateData = () => {
      setCourses(appStore.getCourses());
      setAnnouncements(appStore.getAnnouncements());
      setStudents(appStore.getStudents());
      setMaterials(appStore.getMaterials());
      setAuth(appStore.getAuth());
      setActiveSemester(appStore.getActiveSemester());
    };

    updateData();
    const unsub = appStore.subscribe(updateData);
    return () => unsub();
  }, []);

  // Helper to extract start time in minutes (e.g., "09:10 - 10:50 WIB" -> 9*60 + 10 = 550)
  const parseStartTime = (timeStr?: string): number => {
    if (!timeStr || typeof timeStr !== 'string') return 9999;
    const match = timeStr.match(/(\d{1,2})[:.](\d{2})/);
    if (!match) return 9999;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  };

  // Today's day in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = dayNames[new Date().getDay()];
  const todayCourses = (courses || [])
    .filter((c) => (c?.day || '').toLowerCase().trim() === todayName.toLowerCase().trim())
    .sort((a, b) => parseStartTime(a?.time) - parseStartTime(b?.time));

  const filteredCourses = (courses || []).filter(
    (c) =>
      (c?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c?.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c?.dosen || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPjNames = (pjNims?: string[]) => {
    if (!pjNims || !Array.isArray(pjNims) || pjNims.length === 0) return 'Belum ditugaskan';
    const pjs = (students || []).filter((s) => s?.nim && pjNims.includes(s.nim.trim()));
    if (pjs.length === 0) return 'Belum ditugaskan';
    return pjs.map((p) => p.name || p.nim).join(', ');
  };

  const isUserPj = Boolean(
    auth?.nim &&
      (courses || []).some(
        (c) => Array.isArray(c?.pjNims) && c.pjNims.some((pNim) => (pNim || '').trim() === (auth.nim || '').trim())
      )
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] pb-20 md:pb-0">
      {/* Hero Banner (#4A3200 Unified + Curved Bottom Overlap ala Foto 3) */}
      <section className="relative overflow-hidden bg-[#4A3200] text-white pt-10 pb-20 sm:pt-14 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle Architectural Warm Highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 20%, rgba(212, 161, 42, 0.24), transparent 65%), linear-gradient(180deg, rgba(74, 50, 0, 0.96) 0%, rgba(46, 31, 0, 1) 100%)',
          }}
        />
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#FCE4A6_1px,transparent_1px)] [background-size:22px_22px]" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="flex flex-col items-center">
            {/* Logo Kelas Resmi */}
            <div className="flex justify-center mb-4 animate-fade-up">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[26px] bg-[#332200] p-1.5 ring-4 ring-[#C8962E]/35 shadow-2xl flex items-center justify-center border border-[#FCE4A6]/35">
                <img
                  src="/logo.png"
                  alt="Logo Resmi Hukum Keluarga A 2025"
                  className="w-full h-full object-contain rounded-[20px]"
                />
              </div>
            </div>

            {/* Badge Portal Resmi */}
            <div className="animate-fade-up inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#332200]/90 border border-[#C8962E]/45 text-[#FCE4A6] text-[11px] sm:text-xs font-bold mb-3 shadow-xs">
              <span>Portal Resmi Kelas HK A 2025</span>
            </div>

            {/* Core Title */}
            <h1 className="animate-fade-up delay-100 text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2">
              Hukum Keluarga A 2025
            </h1>

            {/* Full University Subtitle */}
            <p className="animate-fade-up delay-200 text-xs sm:text-sm font-semibold text-[#FCE4A6]/95 tracking-wide uppercase mb-6">
              Fakultas Syariah • UIN Siber Syekh Nurjati Cirebon
            </p>

            {/* Tactile 3D Action Buttons (Foto 4 Inspired) */}
            <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              {auth ? (
                auth.role === 'ADMIN' ? (
                  <Link
                    href="/admin"
                    className="btn-3d-cream w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#4A3200]" />
                    <span>Buka Dashboard Admin</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/mahasiswa"
                      className="btn-3d-cream w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#4A3200]" />
                      <span>Presensi Saya ({(auth.name || 'Mahasiswa').split(' ')[0]})</span>
                    </Link>
                    <Link
                      href="/library"
                      className="btn-3d-bronze w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2"
                    >
                      <BookOpen className="w-4 h-4 text-[#FCE4A6]" />
                      <span>E-Library</span>
                    </Link>
                    {isUserPj && (
                      <Link
                        href="/pj"
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-[#FCE4A6] font-bold text-xs sm:text-sm border border-[#FCE4A6]/30 transition-all flex items-center justify-center space-x-2"
                      >
                        <Sparkles className="w-4 h-4 text-[#FCE4A6]" />
                        <span>Portal PJ Mata Kuliah</span>
                      </Link>
                    )}
                  </>
                )
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn-3d-cream w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-4 h-4 text-[#4A3200]" />
                    <span>Masuk Portal Presensi</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowRosterModal(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#332200]/90 hover:bg-[#291B00] text-[#FCE4A6] font-bold text-xs sm:text-sm border border-[#C8962E]/40 shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <Users className="w-4 h-4 text-[#FCE4A6]" />
                    <span>Daftar {students.length} Mahasiswa</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Curved Sheet Overlap Container (Inspired by Foto 3 Center/Right Screen) */}
      <div className="relative z-20 -mt-10 sm:-mt-12 rounded-t-[32px] sm:rounded-t-[44px] bg-[#FAF7F2] border-t border-[#E6DAC1]/60 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 w-full space-y-9 sm:space-y-11">
          {/* STATISTIK RINGKAS */}
          <section className="bg-white rounded-[26px] p-5 sm:p-6 border border-[#E5D7BC] shadow-[0_6px_20px_-8px_rgba(74,50,0,0.12)]">
            <div className="grid grid-cols-3 gap-2 sm:gap-6 divide-x divide-[#F1E8D6]">
              {/* Stat 1: Mahasiswa */}
              <div className="flex flex-col items-center justify-center text-center px-2 py-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#F6EFE0] text-[#4A3200] border border-[#DFCCA6] flex items-center justify-center mb-1.5 shadow-2xs">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#241904] tracking-tight">
                  <AnimatedCounter value={students.length || 32} duration={1400} />
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-[#6B5730] mt-0.5 uppercase tracking-wider">
                  Mahasiswa
                </div>
              </div>

              {/* Stat 2: Semester Berjalan */}
              <div className="flex flex-col items-center justify-center text-center px-2 py-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#4A3200] text-[#FCE4A6] flex items-center justify-center mb-1.5 shadow-[0_3px_0_#261900]">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#4A3200] tracking-tight flex items-center justify-center">
                  <span className="text-xs sm:text-base font-bold text-[#8C7549] mr-1">Sem</span>
                  <AnimatedCounter value={activeSemester} duration={1000} />
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-[#6B5730] mt-0.5 uppercase tracking-wider">
                  Semester Aktif
                </div>
              </div>

              {/* Stat 3: Mata Kuliah */}
              <div className="flex flex-col items-center justify-center text-center px-2 py-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#F6EFE0] text-[#4A3200] border border-[#DFCCA6] flex items-center justify-center mb-1.5 shadow-2xs">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#241904] tracking-tight">
                  <AnimatedCounter value={courses.length || 11} duration={1200} />
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-[#6B5730] mt-0.5 uppercase tracking-wider">
                  Mata Kuliah
                </div>
              </div>
            </div>
          </section>

          {/* JADWAL KULIAH HARI INI (Spotlight Section) */}
          <section id="jadwal" className="scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#4A3200] text-[#FCE4A6] flex items-center justify-center shadow-[0_3px_0_#261900]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#241904] tracking-tight">
                    Jadwal Kuliah Hari Ini ({todayName})
                  </h2>
                  <p className="text-xs text-[#6B5730]">Perkuliahan terjadwal & akses ruang belajar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-weekly-schedule'))}
                className="btn-3d-cream px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5 text-[#4A3200]" />
                <span>Jadwal {todayName} • Lihat Seminggu</span>
              </button>
            </div>

            {todayCourses.length === 0 ? (
              <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-[#E5D7BC] text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#F6EFE0] border border-[#DFCCA6] text-[#4A3200] mx-auto flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-[#241904]">Tidak Ada Jadwal Kuliah Hari Ini</h3>
                <p className="text-xs text-[#6B5730] mt-1 max-w-md mx-auto">
                  Hari ini ({todayName}) tidak ada perkuliahan terjadwal. Anda dapat memeriksa jadwal hari lainnya atau mengakses repositori materi kuliah di bawah.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayCourses.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#4A3200] text-white rounded-[26px] p-5 border border-[#785406] shadow-[0_8px_20px_-6px_rgba(74,50,0,0.4)] flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="font-mono font-bold text-[#FCE4A6] bg-[#332200] px-2.5 py-1 rounded-lg border border-[#C8962E]/35 text-[11px]">
                          {c.code}
                        </span>
                        <span className="font-bold text-[#FCE4A6] bg-[#634300] px-2.5 py-1 rounded-lg text-[11px]">
                          {c.sks} SKS
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-white mb-1 leading-snug group-hover:text-[#FCE4A6] transition-colors">
                        {c.name}
                      </h3>
                      <p className="text-xs text-[#F6EFE0]/85 mb-3.5 font-medium">
                        {c.dosen}
                      </p>

                      <div className="pt-3 border-t border-white/15 text-xs text-[#F6EFE0]/90 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[#FCE4A6]/75">Waktu & Ruang:</span>
                          <span className="font-bold text-white">{c.time} • {c.room}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#FCE4A6]/75">PJ Kelas:</span>
                          <span className="font-semibold text-[#FCE4A6] truncate max-w-[170px]">{getPjNames(c.pjNims)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedCourse(c)}
                        className="btn-3d-cream py-2.5 px-2 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Materi / Tugas</span>
                      </button>
                      {c.meetingUrl && c.meetingUrl.trim() ? (
                        <a
                          href={c.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center space-x-1 shadow-[0_3px_0_#047857] active:translate-y-[2px] transition-all text-center"
                          title={`Buka ${detectMeetingPlatform(c.meetingUrl).label}`}
                        >
                          <Video className="w-3.5 h-3.5 text-white" />
                          <span className="truncate">{detectMeetingPlatform(c.meetingUrl).actionText}</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="py-2.5 px-2 rounded-xl bg-[#332200]/70 border border-white/10 text-[#F6EFE0]/50 font-semibold text-xs flex items-center justify-center space-x-1 cursor-not-allowed"
                          title="Tautan Google Meet / Zoom belum disematkan oleh PJ atau Dosen"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Belum Ada Link</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* MATA KULIAH - SQUIRCLE 4x3 MENU GRID (Inspired by Foto 6 + #4A3200 Harmonized) */}
          <section id="matakuliah" className="scroll-mt-24">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F6EFE0] text-[#4A3200] border border-[#DFCCA6] flex items-center justify-center shadow-2xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#241904] tracking-tight">
                    Mata Kuliah & Repositori
                  </h2>
                  <p className="text-xs text-[#6B5730]">Pilih mata kuliah untuk akses silabus, materi, & ruang kelas</p>
                </div>
              </div>
              <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-[#F6EFE0] text-[#4A3200] border border-[#DFCCA6]">
                {courses.length} Mata Kuliah
              </span>
            </div>

            <div className="bg-white rounded-[28px] p-4 sm:p-6 border border-[#E5D7BC] shadow-[0_6px_20px_-8px_rgba(74,50,0,0.1)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
                {courses.map((c) => {
                  const courseMats = materials.filter((m) => m.courseId === c.id);
                  const isTodayCourse = (c?.day || '').toLowerCase().trim() === todayName.toLowerCase().trim();

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCourse(c)}
                      className={`group rounded-[22px] p-4 sm:p-5 flex flex-col items-center justify-between text-center min-h-[156px] sm:min-h-[172px] ${
                        isTodayCourse ? 'tile-3d-bronze text-white' : 'tile-3d-cream text-[#241904]'
                      }`}
                    >
                      <CourseTileIcon
                        courseId={c.id}
                        courseName={c.name}
                        isHighlighted={isTodayCourse}
                        badgeCount={courseMats.length}
                        badgeLabel={isTodayCourse ? 'HARI INI' : undefined}
                      />

                      <div className="mt-3 w-full">
                        <h3
                          className={`font-extrabold text-xs sm:text-[13px] leading-snug line-clamp-2 ${
                            isTodayCourse ? 'text-white' : 'text-[#241904] group-hover:text-[#4A3200]'
                          }`}
                        >
                          {c.name}
                        </h3>
                        <div className="mt-1.5 flex items-center justify-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isTodayCourse
                                ? 'bg-[#332200] text-[#FCE4A6] border border-[#C8962E]/40'
                                : 'bg-white/80 text-[#5A4824] border border-[#DFCCA6]'
                            }`}
                          >
                            {c.day || c.code}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                              isTodayCourse
                                ? 'bg-[#634300] text-[#FCE4A6]'
                                : 'bg-[#E8D9BA]/70 text-[#4A3200]'
                            }`}
                          >
                            {c.sks} SKS
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Slot ke-12: Tile "Jadwal Seminggu" melengkapi Grid 4x3 ala "Lainnya" di Foto 6 */}
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-weekly-schedule'))}
                  className="tile-3d-cream group rounded-[22px] p-4 sm:p-5 flex flex-col items-center justify-between text-center min-h-[156px] sm:min-h-[172px]"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-[#DFCCA6] p-2 shadow-[inset_0_2px_2px_rgba(255,255,255,0.9),0_4px_0_#D7C49E] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <div className="grid grid-cols-2 gap-1 w-full h-full">
                      <span className="rounded-md bg-[#4A3200]" />
                      <span className="rounded-md bg-[#C8962E]" />
                      <span className="rounded-md bg-[#785406]" />
                      <span className="rounded-md bg-[#DFCCA6]" />
                    </div>
                  </div>

                  <div className="mt-3 w-full">
                    <h3 className="font-extrabold text-xs sm:text-[13px] leading-snug text-[#4A3200]">
                      Jadwal Seminggu
                    </h3>
                    <div className="mt-1.5 flex items-center justify-center">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-white/85 text-[#5A4824] border border-[#DFCCA6]">
                        Senin – Sabtu
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* PAPAN INFORMASI & PENGUMUMAN KELAS */}
          <section id="pengumuman" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F6EFE0] text-[#4A3200] border border-[#DFCCA6] flex items-center justify-center shadow-2xs">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#241904] tracking-tight">
                    Papan Informasi & Pengumuman
                  </h2>
                  <p className="text-xs text-[#6B5730]">Info akademik, tugas, dan agenda kelas HK A</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#6B5730] bg-white px-3 py-1 rounded-full border border-[#E5D7BC]">
                {announcements.length} Info
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {announcements.map((ann) => (
                <button
                  key={ann.id}
                  type="button"
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="text-left bg-white rounded-[22px] p-4 sm:p-5 border border-[#E5D7BC] hover:border-[#4A3200]/50 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group active:translate-y-[1px]"
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between text-xs mb-2.5">
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                          ann.category === 'PENTING'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : ann.category === 'TUGAS'
                            ? 'bg-[#F6EFE0] text-[#4A3200] border border-[#DFCCA6]'
                            : 'bg-[#F5F2EB] text-[#5A4824] border border-[#E5D7BC]'
                        }`}
                      >
                        {ann.category}
                      </span>
                      <span className="text-[#8C7549] font-mono text-[11px]">{ann.date}</span>
                    </div>
                    <h3 className="font-extrabold text-sm text-[#241904] group-hover:text-[#4A3200] transition-colors line-clamp-2 mb-1.5 leading-snug">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-[#6B5730] line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                  <div className="w-full mt-3.5 pt-2.5 border-t border-[#F1E8D6] flex items-center justify-between text-[11px] text-[#8C7549]">
                    <span className="truncate max-w-[140px]">Oleh: {ann.author}</span>
                    <span className="text-[#4A3200] font-bold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Baca Detail</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Modal: Course Repository / Materi Detail */}
      <ModalDialog
        open={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        labelledBy="course-modal-title"
        maxWidthClass="max-w-2xl"
      >
        {selectedCourse && (
          <>
            {/* Modal Header (#4A3200) */}
            <div className="bg-[#4A3200] p-5 text-white flex items-start justify-between shrink-0">
              <div className="pr-4">
                <span className="text-xs font-mono bg-[#332200] border border-[#C8962E]/40 px-2.5 py-0.5 rounded-lg text-[#FCE4A6]">
                  {selectedCourse.code} • {selectedCourse.sks} SKS
                </span>
                <h1 id="course-modal-title" className="text-lg font-extrabold mt-2">
                  {selectedCourse.name}
                </h1>
                <p className="text-xs text-[#F6EFE0]/85 mt-0.5">
                  Dosen: {selectedCourse.dosen} | PJ: {getPjNames(selectedCourse.pjNims)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                aria-label="Tutup Detail Mata Kuliah"
                className="btn-3d-cream w-9 h-9 rounded-xl flex items-center justify-center text-[#4A3200] shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs bg-[#FAF7F2]">
              <div>
                <h2 className="font-extrabold text-[#4A3200] uppercase tracking-wider text-[11px] mb-1.5">
                  Deskripsi & Silabus
                </h2>
                <p className="text-[#4A3200]/90 leading-relaxed bg-white p-3.5 rounded-2xl border border-[#E5D7BC]">
                  {selectedCourse.description}
                </p>
              </div>

              {/* Ruang Tatap Muka Virtual (Kuliah Online - Protected Login Check) */}
              <div className="p-4 rounded-2xl bg-[#F6EFE0] border border-[#DFCCA6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#4A3200] text-[#FCE4A6] flex items-center justify-center flex-shrink-0 shadow-[0_3px_0_#261900]">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <h2 className="font-extrabold text-[#241904] text-xs sm:text-sm">
                        Kuliah Online (Tatap Muka Virtual)
                      </h2>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Bebas Waktu
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A4824] mt-0.5 leading-relaxed">
                      Ruang tatap muka virtual tanpa batas waktu 60 menit. Mahasiswa wajib login terlebih dahulu untuk bergabung.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                  <Link
                    href={auth ? `/kuliah-online/${selectedCourse.id}` : `/login?redirect=/kuliah-online/${selectedCourse.id}`}
                    className="btn-3d-bronze px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5"
                  >
                    <Video className="w-3.5 h-3.5 text-[#FCE4A6]" />
                    <span>Masuk Ruang Kuliah</span>
                  </Link>
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 p-3.5 bg-white rounded-2xl border border-[#E5D7BC]">
                  <div>
                    <h2 className="font-extrabold text-[#4A3200] uppercase tracking-wider text-[11px]">
                      Berkas Materi & Tugas Kuliah
                    </h2>
                    <p className="text-[11px] text-[#6B5730]">
                      {auth
                        ? 'Daftar materi dan tugas perkuliahan.'
                        : 'Login diperlukan untuk mengunggah materi.'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {auth ? (
                      <label
                        className={`cursor-pointer px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 ${
                          isUploading
                            ? 'bg-stone-400 text-white cursor-not-allowed'
                            : 'btn-3d-bronze'
                        }`}
                      >
                        <Upload className="w-4 h-4 text-[#FCE4A6]" />
                        <span>{isUploading ? 'Mengunggah Berkas...' : 'Upload File / Tugas'}</span>
                        <input
                          type="file"
                          onChange={handleDirectFileUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <Link
                        href="/login"
                        className="btn-3d-cream px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#4A3200]" />
                        <span>Login untuk Upload</span>
                      </Link>
                    )}

                    {selectedCourse.driveLink && auth && (
                      <a
                        href={selectedCourse.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-3d-cream px-3 py-2 rounded-xl font-bold text-xs flex items-center space-x-1"
                      >
                        <span>Google Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* DAFTAR MATERI & TUGAS YANG BISA DIUNDUH */}
                {materials.filter((m) => m.courseId === selectedCourse.id).length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-[#D7C49E] text-[#6B5730] space-y-1.5">
                    <FileText className="w-8 h-8 mx-auto text-[#C5B084]" />
                    <p className="font-semibold text-[#4A3200]">
                      Belum ada berkas atau tugas yang diunggah untuk mata kuliah ini.
                    </p>
                    {!auth && (
                      <p className="text-[11px] text-[#8C7549]">
                        Silakan login terlebih dahulu untuk mengunggah materi perkuliahan.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {materials
                      .filter((m) => m.courseId === selectedCourse.id)
                      .map((mat) => (
                        <div
                          key={mat.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-[#E5D7BC] hover:border-[#4A3200]/45 transition-all bg-white gap-3 shadow-2xs"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#F6EFE0] text-[#4A3200] border border-[#DFCCA6]">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#241904] text-xs sm:text-sm">
                                {mat.title}
                              </p>
                              <div className="text-[11px] text-[#6B5730] mt-1 flex flex-wrap items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 font-semibold text-[#4A3200] bg-[#FAF7F2] border border-[#E5D7BC] px-2 py-0.5 rounded-md">
                                  <User className="w-3 h-3 text-[#4A3200]" />
                                  <span>Oleh: {mat.uploadedBy || 'Mahasiswa'}</span>
                                </span>
                                <span>•</span>
                                <span className="text-[#8C7549]">{mat.uploadedAt}</span>
                                {mat.fileSize && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-[#4A3200] font-semibold text-[10px] bg-[#F6EFE0] px-1.5 py-0.5 rounded border border-[#DFCCA6]">
                                      {mat.fileSize}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions: Unduh & Hapus */}
                          <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                            {auth ? (
                              <a
                                href={mat.url}
                                download={mat.title}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-3d-cream px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5"
                              >
                                <Download className="w-3.5 h-3.5 text-[#4A3200]" />
                                <span>Unduh / Buka</span>
                              </a>
                            ) : (
                              <Link
                                href="/login"
                                className="btn-3d-cream px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5"
                              >
                                <Lock className="w-3.5 h-3.5 text-[#4A3200]" />
                                <span>Login untuk Unduh</span>
                              </Link>
                            )}

                            {auth && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                                title="Hapus berkas ini"
                                aria-label={`Hapus berkas ${mat.title}`}
                                className="p-2 text-[#8C7549] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-[#E5D7BC] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="btn-3d-cream px-5 py-2 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </>
        )}
      </ModalDialog>

      {/* Modal: Detail Pengumuman Pop-up */}
      <ModalDialog
        open={Boolean(selectedAnnouncement)}
        onClose={() => setSelectedAnnouncement(null)}
        labelledBy="announcement-modal-title"
        maxWidthClass="max-w-lg"
      >
        {selectedAnnouncement && (
          <>
            <div className="bg-[#4A3200] p-5 text-white flex items-start justify-between shrink-0">
              <div className="pr-4">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#332200] border border-[#C8962E]/40 text-[#FCE4A6] uppercase tracking-wide">
                  {selectedAnnouncement.category}
                </span>
                <h1 id="announcement-modal-title" className="text-base sm:text-lg font-extrabold mt-2 text-white leading-snug">
                  {selectedAnnouncement.title}
                </h1>
                <p className="text-xs text-[#FCE4A6]/85 mt-1">
                  {selectedAnnouncement.date} • Diposting oleh: {selectedAnnouncement.author}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                aria-label="Tutup Detail Pengumuman"
                className="btn-3d-cream w-9 h-9 rounded-xl flex items-center justify-center text-[#4A3200] shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#FAF7F2] text-[#241904] text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {selectedAnnouncement.content}
            </div>
            <div className="p-4 bg-white border-t border-[#E5D7BC] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="btn-3d-bronze px-5 py-2 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </>
        )}
      </ModalDialog>

      {/* Modal: Roster Mahasiswa Whitelist */}
      <ModalDialog
        open={showRosterModal}
        onClose={() => setShowRosterModal(false)}
        labelledBy="roster-modal-title"
        maxWidthClass="max-w-2xl"
      >
        <div className="bg-[#4A3200] p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <h1 id="roster-modal-title" className="text-base font-extrabold">
              Daftar Mahasiswa Resmi HK A 2025
            </h1>
            <p className="text-xs text-[#FCE4A6]/90">
              Total: {students.length} Mahasiswa Terdaftar di Sistem Whitelist
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowRosterModal(false)}
            aria-label="Tutup Daftar Mahasiswa"
            className="btn-3d-cream w-9 h-9 rounded-xl flex items-center justify-center text-[#4A3200]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5D7BC] bg-[#FAF7F2] text-[#4A3200] font-bold">
                <th className="py-2.5 px-3 text-center w-12">No</th>
                <th className="py-2.5 px-3">NIM</th>
                <th className="py-2.5 px-3">Nama Lengkap</th>
                <th className="py-2.5 px-3 text-center">L/P</th>
                <th className="py-2.5 px-3 text-center">Status PIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E8D6]">
              {[...students]
                .sort((a, b) => a.nim.trim().localeCompare(b.nim.trim(), undefined, { numeric: true }))
                .map((st, idx) => {
                  const cleanNim = (st.nim || '').trim();
                  const maskedNim = cleanNim.length > 4 ? cleanNim.slice(0, -4) + 'xxxx' : 'xxxx';
                  return (
                    <tr key={st.nim} className="hover:bg-[#FAF7F2]">
                      <td className="py-2 px-3 text-center text-[#8C7549]">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-[#4A3200]">{maskedNim}</td>
                      <td className="py-2 px-3 font-medium text-[#241904]">{st.name}</td>
                      <td className="py-2 px-3 text-center text-[#6B5730]">{st.gender}</td>
                      <td className="py-2 px-3 text-center">
                        {st.isPinSet ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F6EFE0] text-[#6B5730]">
                            Belum Set PIN
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#FAF7F2] border-t border-[#E5D7BC] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <p className="text-[11px] text-[#6B5730]">
            Demi privasi identitas, 4 digit terakhir NIM disensor. Hanya mahasiswa pada daftar ini yang dapat login.
          </p>
          <button
            type="button"
            onClick={() => setShowRosterModal(false)}
            className="btn-3d-bronze px-5 py-2 rounded-xl text-xs font-bold shrink-0"
          >
            Tutup
          </button>
        </div>
      </ModalDialog>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div role="status" aria-live="polite" className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 bg-[#4A3200] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#C8962E]/50 flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mobile Double-Back to Exit Toast */}
      {showExitToast && (
        <div role="status" aria-live="polite" className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#241800]/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl border border-[#C8962E]/40 flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#FCE4A6] animate-pulse" />
          <span>Tekan sekali lagi untuk keluar</span>
        </div>
      )}
    </div>
  );
}
