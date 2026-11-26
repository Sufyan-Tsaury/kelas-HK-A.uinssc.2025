'use client';

import React from 'react';
import {
  BookOpen,
  ScrollText,
  Scale,
  Briefcase,
  PieChart,
  Globe,
  HeartHandshake,
  Sparkles,
  Gavel,
  MapPin,
  BookMarked,
} from 'lucide-react';

export function getCourseIcon(courseId: string, courseName: string) {
  const lower = (courseId + ' ' + courseName).toLowerCase();
  if (lower.includes('tafsir')) return BookOpen;
  if (lower.includes('tarikh') || lower.includes('tasyri')) return ScrollText;
  if (lower.includes('qowaid') || lower.includes('fiqhiyah')) return Scale;
  if (lower.includes('bisnis')) return Briefcase;
  if (lower.includes('kewarisan') || lower.includes('waris')) return PieChart;
  if (lower.includes('internasional')) return Globe;
  if (lower.includes('perkawinan')) return HeartHandshake;
  if (lower.includes('ibadah')) return Sparkles;
  if (lower.includes('perdata islam')) return Gavel;
  if (lower.includes('agraria')) return MapPin;
  if (lower.includes('hadits')) return BookMarked;
  return BookOpen;
}

interface CourseTileIconProps {
  courseId: string;
  courseName: string;
  isHighlighted?: boolean;
  badgeCount?: number;
  badgeLabel?: string;
}

export default function CourseTileIcon({
  courseId,
  courseName,
  isHighlighted = false,
  badgeCount = 0,
  badgeLabel,
}: CourseTileIconProps) {
  const Icon = getCourseIcon(courseId, courseName);

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* 3D Soft Tactile Icon Capsule */}
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
          isHighlighted
            ? 'bg-gradient-to-b from-[#FCE08B] to-[#D4A12A] text-[#3B2800] border border-[#FFF3C4]/80 shadow-[inset_0_2px_2px_rgba(255,255,255,0.85),0_4px_0_#8C640F,0_8px_16px_rgba(0,0,0,0.28)]'
            : 'bg-gradient-to-b from-[#664604] to-[#4A3200] text-[#FCE4A6] border border-[#7D580B] shadow-[inset_0_2px_2px_rgba(255,236,191,0.28),0_4px_0_#261900,0_8px_14px_rgba(74,50,0,0.22)]'
        }`}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.1] drop-shadow-xs" aria-hidden="true" />
      </div>

      {/* Top-right Badge (like Foto 6 notification count / NEW tag) */}
      {badgeCount > 0 ? (
        <span
          className="absolute -top-1.5 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white shadow-sm"
          title={`${badgeCount} berkas tersedia`}
        >
          {badgeCount}
        </span>
      ) : badgeLabel ? (
        <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.5 rounded-full bg-gradient-to-b from-[#10B981] to-[#059669] text-white font-black text-[9px] tracking-wide border-2 border-white shadow-sm">
          {badgeLabel}
        </span>
      ) : null}
    </div>
  );
}
