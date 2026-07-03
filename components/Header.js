// components/Header.js
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Camera, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#f6f1e8]/80 border-b border-[#102016]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center gap-4 relative">
        
        {/* Logo Section */}
        <Link className="brand" href="/">
          <img src="/Logo.png" alt="EditGenlx Logo" className="brand-mark" />
          <span>Edit<span>Genlx</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#portfolio-explorer" className="font-semibold text-sm text-[#566258] hover:text-[#4d9e57] transition">
            Galleries
          </a>
          <Link href="/auth" className="font-semibold text-sm text-[#566258] hover:text-[#4d9e57] transition">
            Login / Signup
          </Link>
          <a href="#contact" className="bg-[#4d9e57] text-white px-4 py-2 rounded-full text-xs font-bold tracking-wide hover:bg-[#173022] transition">
            Book Session
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-[#102016]/10 bg-white text-[#102016] shadow-sm"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 mt-3 rounded-3xl border border-[#102016]/10 bg-[#fffdf8] shadow-2xl overflow-hidden z-50">
            <div className="p-2 flex flex-col">
              <a
                href="#portfolio-explorer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-2xl text-sm font-semibold text-[#102016] hover:bg-[#f6f1e8]"
              >
                Galleries
              </a>
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-2xl text-sm font-semibold text-[#102016] hover:bg-[#f6f1e8]"
              >
                Login / Signup
              </Link>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-[#102016] hover:bg-[#4d9e57]"
              >
                Book Now
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}