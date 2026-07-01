'use client';
import React, { createContext, useState, useContext } from 'react';

const GalleryContext = createContext();

export function GalleryProvider({ children }) {
  const [clientEmail, setClientEmail] = useState('');
  const [toasts, setToasts] = useState([]);

  // Function to add a toast notification
  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <GalleryContext.Provider value={{ clientEmail, setClientEmail, addToast, toasts }}>
      {children}
      
      {/* Simple Toast Display Overlay */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="bg-[#102016] text-white px-6 py-3 rounded-full text-sm shadow-lg animate-in slide-in-from-right">
            {toast.message}
          </div>
        ))}
      </div>
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  return useContext(GalleryContext);
}