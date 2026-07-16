import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Sticker from '@/models/Sticker';

/**
 * @swagger
 * /api/admin/stickers:
 *   get:
 *     summary: Retrieve stickers list
 *     description: Retrieve all catalog stickers available for purchase, sorted by cost (lowest first).
 *     tags:
 *       - Stickers
 *     responses:
 *       200:
 *         description: List of stickers
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new sticker
 *     description: Add a new sticker item to the reward catalog.
 *     tags:
 *       - Stickers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stickerId
 *               - emoji
 *               - name
 *               - cost
 *             properties:
 *               stickerId:
 *                 type: string
 *                 description: Unique string identifier (e.g. tiger)
 *               emoji:
 *                 type: string
 *               name:
 *                 type: string
 *               cost:
 *                 type: integer
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sticker created successfully
 *       400:
 *         description: Missing fields or duplicate stickerId
 *       500:
 *         description: Server error
 */

export async function GET() {
  try {
    await connectToDatabase();
    const stickers = await Sticker.find({}).sort({ cost: 1 });
    return NextResponse.json({ success: true, stickers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { stickerId, emoji, name, cost, color } = body;

    if (!stickerId || !emoji || !name || cost === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields (stickerId, emoji, name, cost)' }, { status: 400 });
    }

    const existing = await Sticker.findOne({ stickerId });
    if (existing) {
      return NextResponse.json({ success: false, error: `Stiker dengan ID '${stickerId}' sudah ada.` }, { status: 400 });
    }

    const newSticker = await Sticker.create({
      stickerId,
      emoji,
      name,
      cost,
      color: color || '#ffffff',
    });

    return NextResponse.json({ success: true, sticker: newSticker });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
