'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Download } from 'lucide-react';
import Image from 'next/image';

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjZTllOWU5Ii8+PC9zdmc+';

function getQualityProfile() {
  const profile = {
    lowQuality: 30,
    highQuality: 60,
    upgradeDelayMs: 250,
  };

  if (typeof navigator === 'undefined') return profile;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return profile;

  if (connection.saveData) {
    return { lowQuality: 20, highQuality: 40, upgradeDelayMs: 1500 };
  }

  const effectiveType = connection.effectiveType || '';
  const downlink = Number(connection.downlink || 0);

  if (effectiveType.includes('2g')) {
    return { lowQuality: 20, highQuality: 40, upgradeDelayMs: 1800 };
  }

  if (effectiveType.includes('3g') || downlink > 0 && downlink < 1.5) {
    return { lowQuality: 24, highQuality: 48, upgradeDelayMs: 900 };
  }

  return profile;
}

function ProgressiveThumbnail({ photo, onOpen }) {
  const [shouldLoadHigh, setShouldLoadHigh] = useState(false);
  const [highLoaded, setHighLoaded] = useState(false);
  const profile = useMemo(() => getQualityProfile(), []);

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-lg shadow-md cursor-pointer"
      onClick={onOpen}
    >
      <Image
        src={photo.url}
        alt={photo.title || 'Gallery photo'}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"        quality={profile.lowQuality}
        loading="lazy"
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        onLoad={() => {
          if (shouldLoadHigh) return;
          setTimeout(() => setShouldLoadHigh(true), profile.upgradeDelayMs);
        }}
        className={`object-cover transition-all duration-700 ${
          highLoaded ? 'opacity-0 blur-sm scale-105' : 'opacity-100'
        }`}
      />

      {shouldLoadHigh && (
        <Image
          src={photo.url}
          alt={photo.title || 'Gallery photo'}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          quality={profile.highQuality}
          loading="lazy"
          onLoad={() => setHighLoaded(true)}
          className={`object-cover transition-opacity duration-700 ${
            highLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}

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
    const safeName = fileName || 'photo.jpg';

    // Mobile browsers on HTTP may block file-based sharing/downloading.
    // Open the original image as a fallback so users can long-press to save.
    const openForManualSave = () => {
      window.open(url, '_blank', 'noopener,noreferrer');
      alert('Image opened in a new tab. Long-press it and choose Save Image.');
    };

    try {
      const response = await fetch(url);
      const blob = await response.blob();

      if (window.isSecureContext && navigator.canShare && navigator.share) {
        const file = new File([blob], safeName, { type: blob.type || 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: safeName });
          return;
        }
      }

      const objectUrl = window.URL.createObjectURL(blob);
      try {
        const a = document.createElement('a');
        const supportsDownloadAttr = 'download' in HTMLAnchorElement.prototype;
        a.href = objectUrl;
        a.download = safeName;

        if (supportsDownloadAttr) {
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          openForManualSave();
        }
      } finally {
        window.URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error("Download failed:", error);
      openForManualSave();
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!gallery) return <div className="p-10 text-center">Gallery not found.</div>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">{gallery.title}</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.uploadedPhotos?.map((photo, index) => (
          <ProgressiveThumbnail
            key={index}
            photo={photo}
            onOpen={() => {
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
              alt={selectedPhoto.title || 'Selected gallery photo'}
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