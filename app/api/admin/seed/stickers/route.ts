import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Sticker from '@/models/Sticker';

const DEFAULT_STICKERS = [
  { stickerId: 'tiger', emoji: '🐯', name: 'Macan Berani', cost: 3, color: '#ffe0b2' },
  { stickerId: 'rabbit', emoji: '🐰', name: 'Kelinci Cerdik', cost: 3, color: '#f8bbd0' },
  { stickerId: 'panda', emoji: '🐼', name: 'Panda Riang', cost: 5, color: '#cfd8dc' },
  { stickerId: 'frog', emoji: '🐸', name: 'Katak Lompat', cost: 5, color: '#c8e6c9' },
  { stickerId: 'unicorn', emoji: '🦄', name: 'Kuda Ajaib', cost: 10, color: '#f3e5f5' },
  { stickerId: 'dino', emoji: '🦖', name: 'Dino Tangguh', cost: 10, color: '#d1c4e9' },
  { stickerId: 'rocket', emoji: '🚀', name: 'Roket Angkasa', cost: 15, color: '#b3e5fc' },
  { stickerId: 'donut', emoji: '🍩', name: 'Donat Manis', cost: 8, color: '#ffccbc' },
  { stickerId: 'star_champ', emoji: '🏆', name: 'Juara Bintang', cost: 20, color: '#fff9c4' },
];

export async function GET() {
  try {
    await connectToDatabase();

    // Clear existing
    await Sticker.deleteMany({});

    const seeded = await Sticker.insertMany(DEFAULT_STICKERS);

    return NextResponse.json({
      success: true,
      message: 'Stickers seeded successfully!',
      count: seeded.length,
    });
  } catch (error: any) {
    console.error('Error seeding stickers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
