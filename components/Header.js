// components/Header.js
'use client';

import React from 'react';
import Link from 'next/link';
import { Camera } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#f6f1e8]/80 border-b border-[#102016]/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo Section */}
        <Link className="brand" href="/">
          <img src="/Logo.png" alt="EditGenlx Logo" className="brand-mark" />
          <span>Edit<span>Genlx</span></span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6">
          <a href="#portfolio-explorer" className="font-semibold text-sm text-[#566258] hover:text-[#4d9e57] transition">
            Galleries
          </a>
          <a href="#contact" className="bg-[#4d9e57] text-white px-4 py-2 rounded-full text-xs font-bold tracking-wide hover:bg-[#173022] transition">
            Book Session
          </a>
        </nav>
      </div>
    </header>
  );
}