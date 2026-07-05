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
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        quality={profile.lowQuality}
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
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const isIOS = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

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

  const openIOSShareSheet = async (url, title) => {
    if (!navigator.share) return false;

    try {
      await navigator.share({
        title,
        text: 'Save this photo to Photos',
        url,
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleDownload = async (url, fileName) => {
    const safeName = fileName || 'photo.jpg';

    const openForManualSave = () => {
      window.open(url, '_blank', 'noopener,noreferrer');
      setShowIOSHelp(true);
    };

    try {
      if (isIOS) {
        const shared = await openIOSShareSheet(url, safeName);
        if (!shared) {
          openForManualSave();
        }
        setShowIOSHelp(true);
        return;
      }

      const response = await fetch(url);
      const blob = await response.blob();

      if (window.isSecureContext && navigator.canShare && navigator.share) {
        const file = new File([blob], safeName, { type: blob.type || 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: safeName });
          return;
        }

        await navigator.share({
          title: safeName,
          text: 'Save this photo',
          url,
        });
        return;
      }

      const objectUrl = window.URL.createObjectURL(blob);
      try {
        const a = document.createElement('a');
        const supportsDownloadAttr = 'download' in HTMLAnchorElement.prototype;
        a.href = objectUrl;
        a.download = safeName;

        if (supportsDownloadAttr && !isIOS) {
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
    <div className="min-h-screen bg-gradient-to-b from-[#f6f1e8] via-[#fffdf8] to-[#f6f1e8] px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-sm p-5 sm:p-7">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#102016]">{gallery.title}</h1>
          <p className="text-sm text-[#566258] mt-2">
            {gallery.uploadedPhotos?.length || 0} photos available. Tap any image to view full size.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {gallery.uploadedPhotos?.map((photo, index) => (
            <ProgressiveThumbnail
              key={index}
              photo={photo}
              onOpen={() => {
                setSelectedPhoto(photo);
                setImageLoading(true);
                setShowIOSHelp(false);
              }}
            />
          ))}
        </div>
      </div>

      {/* Full Screen Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-3 sm:p-4">
          <button 
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white bg-black/40 rounded-full p-2" 
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close photo viewer"
          >
            <X size={28} className="sm:w-9 sm:h-9" />
          </button>
          
          <div className="relative max-w-5xl w-full flex flex-col items-center">
            {imageLoading && (
              <div className="text-white font-bold text-base sm:text-xl animate-pulse absolute top-6">
                Loading high-res image...
              </div>
            )}
            
            <img 
              src={selectedPhoto.url} 
              alt={selectedPhoto.title || 'Selected gallery photo'}
              onLoad={() => setImageLoading(false)}
              className={`max-h-[78vh] sm:max-h-[80vh] w-full object-contain mx-auto transition-opacity duration-500 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
            />
            
            <button 
              onClick={() => handleDownload(selectedPhoto.url, selectedPhoto.title)}
              className="mt-4 flex items-center justify-center gap-2 bg-white text-black px-5 py-3 rounded-full font-bold hover:bg-gray-200 transition w-full max-w-sm text-sm sm:text-base"
            >
              <Download size={18} /> Save to Photos
            </button>

            {isIOS && (
              <div className="w-full max-w-sm mt-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white text-xs sm:text-sm">
                <p className="font-bold">iPhone / Safari Save Steps</p>
                <p className="mt-1 text-white/90">Tap Save to Photos, then use one of these:</p>
                <p className="text-white/80 mt-1">1. Share sheet, then tap Save Image</p>
                <p className="text-white/80">2. Opened tab, then long-press image and tap Save to Photos</p>
                <button
                  type="button"
                  onClick={async () => {
                    setShowIOSHelp(true);
                    const shared = await openIOSShareSheet(
                      selectedPhoto.url,
                      selectedPhoto.title || 'Photo'
                    );
                    if (!shared) {
                      window.open(selectedPhoto.url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="mt-3 w-full rounded-full bg-white text-black font-bold py-2 hover:bg-gray-200 transition"
                >
                  Open Share Sheet
                </button>
              </div>
            )}

            {showIOSHelp && isIOS && (
              <p className="text-white/80 text-xs sm:text-sm mt-2 text-center">
                If the share popup did not appear, use the opened image tab and long-press to save.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}