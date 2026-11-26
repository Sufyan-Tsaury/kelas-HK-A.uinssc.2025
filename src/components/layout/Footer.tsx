'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { appStore } from '@/lib/store';
import {
  MapPin,
  ShieldCheck,
  Phone,
  ArrowUpRight,
  BookOpen,
  Users,
  CheckCircle2,
} from 'lucide-react';

// Konfigurasi Nomor Helpdesk:
// Untuk mengganti nomor helpdesk di masa depan, ubah nilai pada dua variabel di bawah ini:
export const HELPDESK_PHONE_DISPLAY = '+62 831-8389-4058'; // Tampilan teks nomor telepon
export const HELPDESK_PHONE_WA = '6283183894058';         // Format WhatsApp (angka saja tanpa simbol +, spasi, atau strip)

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const handleKuliahOnlineClick = (e: React.MouseEvent) => {
    const auth = appStore.getAuth();
    if (!auth) {
      e.preventDefault();
      router.push('/login?redirect=/kuliah-online');
    }
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full bg-[#241800] text-[#E6DAC1] border-t border-[#4A3200] no-print mt-auto relative overflow-hidden pb-20 md:pb-0">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-radial from-[#785406]/25 via-transparent to-transparent pointer-events-none blur-2xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Top Section: Brand & Quick Action Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-10 border-b border-white/[0.08]">
          {/* Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#4A3200] border border-[#C8962E]/45 p-1 shadow-lg flex-shrink-0 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo HK A 2025"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  HK A 2025
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4A3200] text-[#FCE4A6] border border-[#C8962E]/35">
                  Syariah
                </span>
              </div>
              <p className="text-xs text-[#C5B492] font-medium">
                Fakultas Syariah • UIN Siber Syekh Nurjati Cirebon
              </p>
            </div>
          </div>

          {/* Quick Action Badges (Helpdesk & Location) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={`https://wa.me/${HELPDESK_PHONE_WA}?text=Halo%20Admin%20HK%20A%202025,%20saya%20ingin%20bertanya:`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#382600] hover:bg-[#4A3200] border border-[#785406]/60 text-xs text-[#F6EFE0] hover:text-white transition-all group"
            >
              <Phone className="w-3.5 h-3.5 text-[#FCE4A6] group-hover:scale-110 transition-transform" />
              <span>Helpdesk: <strong className="font-mono text-white font-medium">{HELPDESK_PHONE_DISPLAY}</strong></span>
              <ArrowUpRight className="w-3 h-3 text-[#C5B492] group-hover:text-[#FCE4A6] transition-colors" />
            </a>

            <div className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#C5B492]">
              <MapPin className="w-3.5 h-3.5 text-[#C8962E]" />
              <span>Cirebon, Jawa Barat</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Clean Grid Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 py-10">
          {/* Col 1: Layanan Utama */}
          <div>
            <h4 className="text-[11px] font-bold text-[#FCE4A6] uppercase tracking-widest mb-3.5">
              Layanan Utama
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C5B492]">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Beranda Utama</span>
                </Link>
              </li>
              <li>
                <Link href="/#jadwal" className="hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Jadwal Kuliah Hari Ini</span>
                </Link>
              </li>
              <li>
                <Link href="/#matakuliah" className="hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Mata Kuliah & Tugas</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/kuliah-online"
                  onClick={handleKuliahOnlineClick}
                  className="hover:text-white transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Kuliah Online (Meet Virtual)</span>
                </Link>
              </li>
              <li>
                <Link href="/#pengumuman" className="hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Informasi Kelas</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Portal Akses */}
          <div>
            <h4 className="text-[11px] font-bold text-[#FCE4A6] uppercase tracking-widest mb-3.5">
              Portal Akses
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C5B492]">
              <li>
                <Link href="/mahasiswa" className="hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Portal Presensi Mahasiswa</span>
                </Link>
              </li>
              <li>
                <Link href="/pj" className="hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Portal PJ Mata Kuliah</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Portal Administrator</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Masuk / Autentikasi</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Standar Sistem */}
          <div>
            <h4 className="text-[11px] font-bold text-[#FCE4A6] uppercase tracking-widest mb-3.5">
              Standar Sistem
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C5B492]">
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FCE4A6] flex-shrink-0" />
                <span>Whitelist NIM Mahasiswa</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FCE4A6] flex-shrink-0" />
                <span>PIN Mandiri 6 Digit</span>
              </li>
              <li className="flex items-center space-x-2">
                <Users className="w-3.5 h-3.5 text-[#FCE4A6] flex-shrink-0" />
                <span>Otoritas Sesi PJ Kelas</span>
              </li>
              <li className="flex items-center space-x-2">
                <BookOpen className="w-3.5 h-3.5 text-[#FCE4A6] flex-shrink-0" />
                <span>Repositori Berkas Kuliah</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Lembaga / Afiliasi */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <h4 className="text-[11px] font-bold text-[#FCE4A6] uppercase tracking-widest mb-3.5">
              Institusi
            </h4>
            <p className="text-xs text-[#C5B492] leading-relaxed">
              Program Studi Hukum Keluarga, Fakultas Syariah, UIN Siber Syekh Nurjati Cirebon.
            </p>
            <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#382600] border border-[#785406]/50 text-[11px] text-[#FCE4A6]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cyber Islamic University</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Clean Copyright & Status */}
        <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9E8B64]">
          <p>© {currentYear} Hukum Keluarga A 2025. All rights reserved.</p>
          <div className="flex items-center space-x-2 text-[11px] text-stone-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Sistem Presensi & Repositori Digital Aktif</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
