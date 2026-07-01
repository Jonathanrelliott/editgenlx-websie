'use client';
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';

export default function ClientAccessWall({ gallery }) {
  const { setUnlockedGalleries, addToast } = useGallery();
  const [passwordInput, setPasswordInput] = useState('');

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passwordInput === gallery.password) {
      setUnlockedGalleries((prev) => [...prev, gallery.id]);
      addToast('Gallery unlocked successfully!');
    } else {
      addToast('Incorrect credentials.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white border p-8 rounded-[2.5rem] shadow-xl text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#173022]/10 text-[#4d9e57] flex items-center justify-center mx-auto">
        <Lock className="w-7 h-7" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-[#102016]">Private Gallery Folder</h2>
        <p className="text-xs text-[#566258] mt-2">Enter custom access code to view files.</p>
      </div>
      <form onSubmit={handleUnlock} className="space-y-4">
        <input type="password" required placeholder="••••••••" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3.5 bg-[#f6f1e8]/50 border rounded-xl text-center tracking-widest text-sm outline-none" />
        <button type="submit" className="w-full bg-[#102016] text-white font-extrabold py-3.5 rounded-full text-sm uppercase tracking-wide">Validate Access</button>
      </form>
    </div>
  );
}