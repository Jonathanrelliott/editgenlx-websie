'use client';
import React from 'react';
import { Check } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';

export default function Toast() {
  const { toasts } = useGallery();

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div key={toast.id} className={`px-4 py-3.5 rounded-2xl border text-sm font-semibold flex items-center gap-2 shadow-xl transition-all duration-300 ${toast.type === 'success' ? 'bg-white border-[#4d9e57]/20 text-[#4d9e57]' : 'bg-white border-red-200 text-red-500'}`}>
          <Check className="w-4 h-4" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}