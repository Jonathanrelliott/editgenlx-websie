'use client';
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';

export default function EmailModal({ onClose, onAuthenticated }) {
  const { clientEmail, setClientEmail, addToast } = useGallery();
  const [loading, setLoading] = useState(false);

  const handleContactSubmit = async (e) => {
  e.preventDefault();
  setFormStatus({ loading: true, success: false, error: '' });

  // Map your frontend state to the keys expected by your backend
  const payload = {
    name: formData.name,
    email: formData.email,
    plan: formData.packageType,
    details: formData.notes // Ensure this key matches your API's expected 'details'
  };

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) // Send the mapped payload
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Failed to dispatch.');
    
    setFormStatus({ loading: false, success: true, error: '' });
    setFormData({ name: '', email: '', packageType: 'Game & Match Coverage', notes: '' });
  } catch (err) {
    setFormStatus({ loading: false, success: false, error: err.message });
  }
};

  return (
    <div className="fixed inset-0 bg-[#102016]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border w-full max-w-md rounded-[2rem] p-8 relative shadow-2xl text-center">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-xl"
          aria-label="Close modal"
        >×</button>
        
        <div className="w-14 h-14 rounded-full bg-[#4d9e57]/10 text-[#4d9e57] flex items-center justify-center mx-auto mb-3">
          <Mail className="w-6 h-6" />
        </div>
        
        <h3 className="text-2xl font-extrabold text-[#102016] mb-2">Verify Client Session</h3>
        <p className="text-xs text-[#566258] mb-4">Enter your email address to validate your photo access.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            required 
            placeholder="athlete@school.com" 
            value={clientEmail} 
            onChange={(e) => setClientEmail(e.target.value)} 
            className="w-full border px-4 py-3.5 rounded-2xl text-sm outline-none" 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#4d9e57] text-white font-extrabold py-3.5 rounded-full text-sm uppercase disabled:opacity-50"
          >
            {loading ? "Authorizing..." : "Authorize Session"}
          </button>
        </form>
      </div>
    </div>
  );
}