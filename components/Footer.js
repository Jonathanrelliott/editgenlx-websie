'use client';
import React from 'react';
import Link from 'next/link';
import { Camera } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-black/5 py-10 bg-[#f0e8db]/40">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#566258] font-semibold">
        <div className="flex items-center gap-2">
          <img src="/Logo.png" alt="EditGenlx Logo" className="brand-mark" />
          <span>Edit<span>Genlx</span></span>
          <span>© 2026 <Link className="brand" href="/">
          
        </Link>. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-[#4d9e57]">Home</Link>
          <Link href="/galleries" className="hover:text-[#4d9e57]">Galleries</Link>
        </div>
      </div>
    </footer>
  );
}