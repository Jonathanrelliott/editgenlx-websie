// app/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Calendar, Image as ImageIcon, ExternalLink, Check, Mail, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  // Pull live data from MongoDB state engine
  const [galleries, setGalleries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formData, setFormData] = useState({ name: '', email: '', packageType: 'Game & Match Coverage', notes: '' });
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: '' });
  const [plans, setPlans] = useState([]);

  // Fetch the live gallery components on page mount
useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Galleries
        const galleryRes = await fetch('/api/galleries');
        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          setGalleries(galleryData);
        }

        // 2. Fetch Pricing Plans
        const plansRes = await fetch('/api/settings');
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(plansData); // Ensure you have 'const [plans, setPlans] = useState([]);' at the top
        }
      } catch (err) {
        console.error("Failed to extract active data array from cluster stream:", err);
      }
    }
    fetchData();
  }, []);

  

  // Filter only public items processed directly out of Mongo
  const filteredGalleries = galleries.filter(gallery => {
    const matchesSearch = gallery.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || gallery.category === selectedCategory;
    return gallery.isVisible && matchesSearch && matchesCategory;
    // return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = async (e) => {
  e.preventDefault();
  setFormStatus({ loading: true, success: false, error: '' });

  // Map the fields exactly as the API expects them
  const payload = {
    name: formData.name,
    email: formData.email,
    plan: formData.packageType,
    details: formData.notes // Map 'notes' to 'details' here
  };

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) // Send the mapped payload
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to dispatch.');
    
    setFormStatus({ loading: false, success: true, error: '' });
    setFormData({ name: '', email: '', packageType: 'Game & Match Coverage', notes: '' });
  } catch (err) {
    setFormStatus({ loading: false, success: false, error: err.message });
  }
};

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#102016]">
      {/* ... (Hero section remains the same) ... */}
        <section className="py-24 px-6 text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-6xl font-extrabold tracking-tight text-[#102016]">
            Where Memories, <span className="text-[#4d9e57]">Ignite.</span>
          </h1>
          <p className="text-lg text-[#566258]">
            Professional photography for sports, events, and personal milestones. Explore our <a href="#portfolio-explorer" className="text-[#4d9e57] hover:underline">Galleries</a> or book a session today.
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-4">
          <a href="#portfolio-explorer" className="px-8 py-3 bg-[#102016] text-white rounded-full font-bold hover:bg-[#4d9e57] transition-all">
            View Galleries
          </a>
          <a href="#contact" className="px-8 py-3 bg-white border border-black/10 text-[#102016] rounded-full font-bold hover:border-[#4d9e57] transition-all">
            Book a Session
          </a>
        </div>
      </section>
      {/* PORTFOLIO EXPLORER */}
      <section id="portfolio-explorer" className="py-24 bg-white/40 border-t border-b border-[#102016]/5">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#4d9e57]">Public Records</span>
              <h2 className="text-4xl font-extrabold tracking-tight mt-2">Galleries</h2>
            </div>
            {/* Category buttons have been removed */}
          </div>

          <div className="bg-[#fffdf8] border border-black/5 p-4 rounded-2xl shadow-sm max-w-md flex items-center gap-3">
            <Search className="text-[#566258] w-4 h-4 shrink-0" />
            <input 
              type="text" 
              placeholder="Filter by event location name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {filteredGalleries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGalleries.map(gallery => (
                <div key={gallery.id} className="group bg-[#fffdf8] border border-[#102016]/10 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  <div className="relative aspect-[3/2] bg-[#f0e8db] overflow-hidden">
                    <img 
                      src={gallery.uploadedPhotos?.[0]?.url || '/Heading.png'} 
                      alt={gallery.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="font-extrabold text-lg text-[#102016]">{gallery.title}</h3>
                    <Link href={`/${gallery.slug || gallery.id}`}>
                      <button className="w-full py-3 bg-[#102016] hover:bg-[#4d9e57] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                        Browse Gallery <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-black/10">
              <p className="text-sm text-[#566258] font-medium">No live database galleries currently matching that query.</p>
            </div>
          )}
        </div>
      </section>

      {/* PRICING MENU SECTION */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 space-y-12">
  {/* ... title section ... */}

  {/* CSS Grid layout */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
    {plans
      .sort((a, b) => (b.isFeatured ? 1 : -1)) // Sorts so Featured is always second if possible
      .map((plan, i) => (
        <div 
          key={i} 
          className={`p-8 rounded-[2rem] flex flex-col justify-between space-y-6 shadow-sm transition-all ${
            plan.isFeatured 
              ? "border-2 border-[#4d9e57] shadow-md relative md:order-2" // md:order-2 moves it to middle
              : "bg-[#fffdf8] border border-[#102016]/10"
          }`}
        >
          {plan.isFeatured && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#4d9e57] text-white text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full">
              Most Common
            </div>
          )}
          
          {/* ... Plan Content ... */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold">{plan.name}</h3>
            <div className="text-3xl font-extrabold">{plan.price}</div>
            <ul className="space-y-2 text-sm text-[#566258] pt-4 border-t border-black/5">
              {plan.features?.map((feat, fI) => (
                <li key={fI} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#4d9e57]" /> {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* ... Button ... */}
          <a 
  href="#contact" 
  onClick={() => setFormData({...formData, packageType: plan.name})} 
  // Changed bg-[#102016] to bg-[#4d9e57] and hover to a darker green
  className="w-full text-center py-3 bg-[#4d9e57] text-white font-bold rounded-xl text-xs hover:bg-[#173022] transition-colors"
>
  {plan.price === "Custom" ? "Inquire Now" : "Book Event"}
</a>
        </div>
      ))}
  </div>
</section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-[#fffdf8] border-t border-[#102016]/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center space-y-2 mb-12">
            <Mail className="w-8 h-8 text-[#4d9e57] mx-auto" />
            <h2 className="text-3xl font-extrabold tracking-tight">Initiate Mail Dispatch</h2>
          </div>
          <form onSubmit={handleContactSubmit} className="space-y-6 bg-[#f6f1e8]/60 border border-black/5 p-8 rounded-[2rem]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#566258] mb-1.5">Your Full Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-black/10 px-4 py-3 rounded-xl text-sm outline-none focus:border-[#4d9e57]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#566258] mb-1.5">Email Destination Return</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-black/10 px-4 py-3 rounded-xl text-sm outline-none focus:border-[#4d9e57]" />
              </div>
            </div>
              <section id="contact">
        <select 
          value={formData.packageType} 
          onChange={(e) => setFormData({...formData, packageType: e.target.value})}
          className="w-full bg-white border border-black/10 px-4 py-3 rounded-xl text-sm"
        >
          {plans.map((plan, i) => (
            <option key={i} value={plan.name}>{plan.name}</option>
          ))}
        </select>
        {/* ... remainder of form ... */}
      </section>
            <div>
              <label className="block text-xs font-bold text-[#566258] mb-1.5">Session Scope / Framing Instructions</label>
              <textarea rows="4" required value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-white border border-black/10 p-4 rounded-xl text-sm outline-none focus:border-[#4d9e57] resize-none" />
            </div>
            {formStatus.error && <p className="text-xs text-red-600 font-bold">{formStatus.error}</p>}
            {formStatus.success && <div className="p-4 bg-[#173022] text-[#79c66a] text-xs font-bold rounded-xl flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Message securely relayed via Mailtrap API routing!</div>}
            <button type="submit" disabled={formStatus.loading} className="w-full py-4 bg-[#4d9e57] hover:bg-[#173022] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
              {formStatus.loading ? 'Transmitting...' : ( <>Transmit Message <Send className="w-3.5 h-3.5" /></> )}
            </button>
          </form>
        </div>
      </section>

    </main>
  );
}