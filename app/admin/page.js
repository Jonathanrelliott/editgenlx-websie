'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  FolderUp,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';

export default function GalleryPage({ gallery }) { // Assuming gallery data is passed as a prop
  const [galleries, setGalleries] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [showAll, setShowAll] = useState({});
  const [processingGalleryId, setProcessingGalleryId] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [activeUploadId, setActiveUploadId] = useState(null);

// Add 'pricingPlans' to your AdminDashboard component states
const [pricingPlans, setPricingPlans] = useState([]); // Add this

// Update your existing useEffect
useEffect(() => {
  // Your existing gallery fetch
  fetch('/api/galleries')
    .then(res => res.json())
    .then(data => setGalleries(data));

  // Add this to fetch plans
  fetch('/api/settings')
    .then(res => res.json())
    .then(data => setPricingPlans(data))
    .catch(err => console.error("Failed to fetch plans:", err));
}, []);
  const triggerUpload = (galleryId) => {
    setActiveUploadId(galleryId);
    fileInputRef.current.click();
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0 || !activeUploadId) return;
    
    setProcessingGalleryId(activeUploadId);
    let newPhotos = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. Get secure URL from our API
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: JSON.stringify({ fileName: file.name, fileType: file.type })
        });
        const { signedUrl, error } = await res.json();
        if (error) throw new Error(error);

        // 2. Upload directly to Cloudflare R2
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', signedUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const currentProgress = Math.round(((i / files.length) + (e.loaded / e.total / files.length)) * 100);
              setProgress(currentProgress);
            }
          };
          xhr.onload = () => resolve();
          xhr.onerror = () => reject("Upload failed");
          xhr.send(file);
        });

        // 3. Save the public Cloudflare R2 URL to the local array
        newPhotos.push({ 
          title: file.name, 
          url: `${process.env.NEXT_PUBLIC_R2_URL}/${file.name}` 
        });
      }

      // 4. Update the specific gallery with the new photo previews
      setGalleries(prev => prev.map(g => g.id === activeUploadId ? {
        ...g,
        uploadedPhotos: [...(g.uploadedPhotos || []), ...newPhotos]
      } : g));

    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during upload. Check the console.");
    } finally {
      setProcessingGalleryId(null);
      setProgress(0);
      setActiveUploadId(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  const saveAllToDatabase = async () => {
    try {
      const res = await fetch('/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleries)
      });
      if (res.ok) {
        alert("All changes successfully saved to the database!");
      } else {
        alert("Failed to save changes.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createNewGallery = () => {
    const newId = `gal-${Date.now()}`;
    setGalleries([{
      id: newId,
      slug: `new-gallery-${Date.now()}`,
      title: 'New Event Gallery',
      isVisible: false,
      photoPrice: 5.00,
      downloadLimit: 1,
      password: '',
      uploadedPhotos: []
    }, ...galleries]);
  };

  const updateGalleryField = (id, field, value) => {
    setGalleries(galleries.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const deletePhoto = (galleryId, photoUrl) => {
    setGalleries(galleries.map(g => g.id === galleryId ? {
      ...g,
      uploadedPhotos: g.uploadedPhotos.filter(p => p.url !== photoUrl)
    } : g));
  };

  // --- Plan Helpers ---
  const addPlan = () => setPricingPlans([...pricingPlans, { name: 'New Plan', price: '$0', features: [] }]);
  const removePlan = (i) => setPricingPlans(pricingPlans.filter((_, index) => index !== i));
  
  // --- Feature Helpers ---
  const addFeature = (planIndex) => {
    const next = [...pricingPlans];
    next[planIndex].features.push('New Feature');
    setPricingPlans(next);
  };

  const removeFeature = (planIndex, featureIndex) => {
    const next = [...pricingPlans];
    next[planIndex].features.splice(featureIndex, 1);
    setPricingPlans(next);
  };

  const toggleGalleryPhotos = (galleryId) => {
    setShowAll((prev) => ({ ...prev, [galleryId]: !prev[galleryId] }));
  };

  return (
    <div className="p-8 bg-[#f6f1e8] min-h-screen text-[#102016] font-sans pb-32">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Gallery Admin Portal</h1>
            <p className="text-sm text-[#566258] mt-1">Manage database records and R2 Cloudflare assets.</p>
          </div>
          <button 
            onClick={createNewGallery} 
            className="flex items-center gap-2 bg-[#4d9e57] hover:bg-[#79c66a] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
          >
            <Plus size={18} /> Create New Gallery
          </button>
        </div>

        {/* Hidden File Input used by all galleries */}
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          className="hidden" 
          onChange={(e) => handleUpload(Array.from(e.target.files))} 
        />

        {/* Gallery List */}
        <div className="space-y-6">
          {galleries.map((g) => {
            const allPhotos = g.uploadedPhotos || [];
            const isExpanded = !!showAll[g.id];
            const visiblePhotos = isExpanded ? allPhotos : allPhotos.slice(0, 6);
            const hiddenCount = Math.max(allPhotos.length - visiblePhotos.length, 0);

            return (
            <div key={g.id} className="bg-white border border-black/10 p-6 rounded-3xl shadow-sm transition-all hover:shadow-md">
              
              <div className="flex justify-between items-start mb-6">
                <input 
                  type="text" 
                  value={g.title} 
                  onChange={(e) => updateGalleryField(g.id, 'title', e.target.value)} 
                  className="text-2xl font-extrabold bg-transparent border-b border-transparent hover:border-gray-200 focus:border-[#4d9e57] outline-none w-1/2 transition-colors pb-1"
                  placeholder="Gallery Title"
                />
                <button 
                  onClick={() => updateGalleryField(g.id, 'isVisible', !g.isVisible)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${g.isVisible ? 'bg-[#4d9e57]/10 text-[#4d9e57]' : 'bg-gray-100 text-gray-500'}`}
                >
                  {g.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  {g.isVisible ? 'Visible to Public' : 'Hidden'}
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-[#f6f1e8]/50 p-4 rounded-2xl border border-black/5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#566258] uppercase tracking-wider">Routing ID (Slug)</label>
                  <input 
                    type="text" 
                    value={g.slug} 
                    onChange={(e) => updateGalleryField(g.id, 'slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                    className="w-full text-xs p-2 rounded-lg border border-black/10 outline-none focus:border-[#4d9e57] font-mono"
                    placeholder="e.g. varsity-baseball"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#566258] uppercase tracking-wider">Price per Photo ($)</label>
                  <input 
                    type="number" 
                    value={g.photoPrice} 
                    onChange={(e) => updateGalleryField(g.id, 'photoPrice', parseFloat(e.target.value))} 
                    className="w-full text-xs p-2 rounded-lg border border-black/10 outline-none focus:border-[#4d9e57]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#566258] uppercase tracking-wider">Free Images/User</label>
                  <input 
                    type="number" 
                    value={g.downloadLimit} 
                    onChange={(e) => updateGalleryField(g.id, 'downloadLimit', parseInt(e.target.value))} 
                    className="w-full text-xs p-2 rounded-lg border border-black/10 outline-none focus:border-[#4d9e57]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#566258] uppercase tracking-wider">Gallery Password</label>
                  <input 
                    type="text" 
                    value={g.password || ''} 
                    onChange={(e) => updateGalleryField(g.id, 'password', e.target.value === '' ? null : e.target.value)} 
                    className="w-full text-xs p-2 rounded-lg border border-black/10 outline-none focus:border-[#4d9e57]"
                    placeholder="Leave blank for none"
                  />
                </div>
              </div>

              {/* Upload & Progress Section */}
              <div className="mb-6">
                <button 
                  onClick={() => triggerUpload(g.id)} 
                  disabled={processingGalleryId !== null}
                  className="flex items-center gap-2 bg-[#102016] hover:bg-[#20402c] disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                >
                  {processingGalleryId === g.id ? <Loader2 size={16} className="animate-spin" /> : <FolderUp size={16} />}
                  Upload Images to Cloudflare R2
                </button>

                {/* Progress Bar Display */}
                {processingGalleryId === g.id && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs font-bold text-[#566258] mb-1">
                      <span>Uploading directly to R2 Storage...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#4d9e57] h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Previews */}
              <div className="border-t border-black/5 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#566258] mb-3 flex items-center gap-2">
                  <ImageIcon size={14} /> Uploaded Assets ({g.uploadedPhotos?.length || 0})
                </h4>
                
                {allPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {visiblePhotos.map((photo, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-black/10 bg-gray-100">
                        <img 
                          src={photo.url} 
                          alt={photo.title} 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          onClick={() => deletePhoto(g.id, photo.url)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                          title="Remove from DB"
                        >
                          <Trash2 size={12} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-[9px] p-1 truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {photo.title}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-xs font-medium text-gray-400">No images uploaded yet.</p>
                  </div>
                )}

                {allPhotos.length > 6 && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => toggleGalleryPhotos(g.id)}
                      className="text-xs font-bold px-4 py-2 rounded-full bg-[#f6f1e8] hover:bg-[#e9e2d5] text-[#102016] border border-black/10 transition"
                    >
                      {isExpanded ? 'Show fewer images' : `Show all images (+${hiddenCount})`}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )})}

          {galleries.length === 0 && (
             <div className="text-center py-16 bg-white border border-black/5 rounded-3xl shadow-sm">
               <p className="text-gray-500 font-medium">No galleries found in the database. Create one to get started.</p>
             </div>
          )}
        </div>

      </div>

      {/* plans */}
      <div className="p-8 bg-[#f6f1e8] min-h-screen">
      <h2 className="text-2xl font-extrabold mb-6">Manage Pricing Plans</h2>
      
      <div className="grid gap-6">
        {pricingPlans.map((plan, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-black/10 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <input value={plan.name} onChange={(e) => { 
                const next = [...pricingPlans]; next[i].name = e.target.value; setPricingPlans(next);
              }} className="text-xl font-bold border-b border-gray-300 w-1/2" />
              <button onClick={() => removePlan(i)} className="text-red-500"><Trash2 size={18} /></button>
            </div>
            {/* futured plan */}
            <label className="flex items-center gap-2 text-sm font-bold mb-4">
    <input 
      type="checkbox" 
      checked={plan.isFeatured || false} 
      onChange={(e) => {
        const next = [...pricingPlans];
        next[i].isFeatured = e.target.checked;
        setPricingPlans(next);
      }}
    />
    Featured Plan
  </label>
            <input value={plan.price} onChange={(e) => { 
                const next = [...pricingPlans]; next[i].price = e.target.value; setPricingPlans(next);
              }} className="text-lg font-mono mb-4 block border rounded p-1" />

            {/* Features List */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-bold uppercase text-gray-500">Features</p>
              {plan.features.map((feat, fI) => (
                <div key={fI} className="flex gap-2">
                  <input value={feat} onChange={(e) => {
                    const next = [...pricingPlans]; next[i].features[fI] = e.target.value; setPricingPlans(next);
                  }} className="w-full text-sm p-1 border rounded" />
                  <button onClick={() => removeFeature(i, fI)} className="text-gray-400 hover:text-red-500">x</button>
                </div>
              ))}
              <button onClick={() => addFeature(i)} className="text-xs text-[#4d9e57] font-bold">+ Add Feature</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addPlan} className="mt-6 flex items-center gap-2 bg-gray-200 p-4 rounded-xl font-bold">
        <Plus size={18} /> Add New Plan
      </button>

      <button onClick={async () => {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: pricingPlans }),
        });
        alert("Saved!");
      }} className="mt-8 bg-[#102016] text-white px-8 py-3 rounded-full font-bold">Save All Changes</button>
    </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-black/5 p-4 flex justify-center z-50">
        <button 
          onClick={saveAllToDatabase}
          className="flex items-center gap-2 bg-[#102016] hover:bg-[#4d9e57] text-white px-8 py-3.5 rounded-full font-extrabold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all w-full max-w-md justify-center"
        >
          <Save size={18} />
          Submit All Changes to Database
        </button>
      </div>
    </div>
  );
}