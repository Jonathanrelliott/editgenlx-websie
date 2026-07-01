'use client'; 

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function GalleryPage({ params }) {
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Unwrapping params as it is a promise in Next.js 14+
      const resolvedParams = await params;
      const res = await fetch(`/api/galleries?slug=${resolvedParams.slug}`);
      const data = await res.json();
      setGallery(data);
      setLoading(false);
    }
    fetchData();
  }, [params]);

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName || 'photo.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Could not download image.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!gallery) return <div className="p-10 text-center">Gallery not found.</div>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">{gallery.title}</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.uploadedPhotos?.map((photo, index) => (
          <img 
            key={index} 
            src={photo.url} 
            alt={photo.title || "Gallery photo"} 
            className="w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition"
            onClick={() => {
              setSelectedPhoto(photo);
              setImageLoading(true); // Reset loader when opening modal
            }}
          />
        ))}
      </div>

      {/* Full Screen Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button 
            className="absolute top-5 right-5 text-white" 
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={40} />
          </button>
          
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            {imageLoading && (
              <div className="text-white font-bold text-xl animate-pulse absolute">
                Loading high-res image...
              </div>
            )}
            
            <img 
              src={selectedPhoto.url} 
              onLoad={() => setImageLoading(false)}
              className={`max-h-[80vh] w-full object-contain mx-auto transition-opacity duration-500 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
            />
            
            <button 
              onClick={() => handleDownload(selectedPhoto.url, selectedPhoto.title)}
              className="mt-4 flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition w-full max-w-xs"
            >
              <Download size={20} /> Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}