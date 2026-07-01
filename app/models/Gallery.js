import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  id: String,
  filename: String,
  url: String,
});

const GallerySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: 'Sports' },
  date: String,
  isLocked: { type: Boolean, default: false },
  password: { type: String, default: '' },
  downloadLimit: { type: Number, default: 1 },
  photoPrice: { type: Number, default: 0.00 },
  isAllFree: { type: Boolean, default: true },
  photos: [PhotoSchema],
}, { timestamps: true });

// Prevents Next.js recompilation errors during hot-reloads
export default mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);