import { NextResponse } from 'next/server';
import clientPromise from '../../lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const client = await clientPromise;
  const db = client.db('editgenlx');
  
  if (slug) {
    const data = await db.collection('galleries').findOne({ slug: slug });
    return NextResponse.json(data);
  }
  try {
    // Allows the home page to fetch ONLY visible galleries by calling /api/galleries?public=true
    const { searchParams } = new URL(req.url);
    const isPublicOnly = searchParams.get('public') === 'true';

    const client = await clientPromise;
    const db = client.db('editgenlx');
    
    const query = isPublicOnly ? { isVisible: true } : {};
    const data = await db.collection('galleries').find(query).toArray();
    
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const galleries = await req.json();
    const client = await clientPromise;
    const db = client.db('editgenlx');

    // Process each gallery independently to avoid MongoDB array/immutable field errors
    const updatePromises = galleries.map(async (g) => {
      const galleryData = { ...g };
      delete galleryData._id; // Remove the internal MongoDB ID before updating

      return db.collection('galleries').updateOne(
        { id: g.id }, 
        { $set: galleryData }, 
        { upsert: true }
      );
    });

    await Promise.all(updatePromises);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}