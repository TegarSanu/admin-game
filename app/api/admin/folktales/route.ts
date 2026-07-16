import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FolkTale from '@/models/FolkTale';

/**
 * @swagger
 * /api/admin/folktales:
 *   get:
 *     summary: Get all folk tales
 *     description: Retrieve a list of all registered folk tales, sorted alphabetically by title.
 *     tags:
 *       - Folk Tales
 *     responses:
 *       200:
 *         description: List of folk tales
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new folk tale
 *     description: Add a new interactive folk tale with multiple pages to the database.
 *     tags:
 *       - Folk Tales
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - title
 *             properties:
 *               id:
 *                 type: string
 *                 description: Unique string ID (e.g., timun_mas)
 *               title:
 *                 type: string
 *               icon:
 *                 type: string
 *               region:
 *                 type: string
 *               coverColor:
 *                 type: string
 *               accentColor:
 *                 type: string
 *               pages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - text
 *                     - illustrationKey
 *                   properties:
 *                     text:
 *                       type: string
 *                     illustrationKey:
 *                       type: string
 *                     bgColor:
 *                       type: string
 *     responses:
 *       200:
 *         description: Folk tale created successfully
 *       400:
 *         description: Missing fields or ID already exists
 *       500:
 *         description: Server error
 */

export async function GET() {
  try {
    await connectToDatabase();
    const folktales = await FolkTale.find({}).sort({ title: 1 });
    return NextResponse.json({ success: true, folktales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, title, icon, region, coverColor, accentColor, pages } = body;

    if (!id || !title) {
      return NextResponse.json({ success: false, error: 'Missing required fields (id, title)' }, { status: 400 });
    }

    const existing = await FolkTale.findOne({ id });
    if (existing) {
      return NextResponse.json({ success: false, error: `Cerita dengan ID '${id}' sudah ada.` }, { status: 400 });
    }

    const newTale = await FolkTale.create({
      id,
      title,
      icon: icon || '📖',
      region: region || '',
      coverColor: coverColor || '#ffffff',
      accentColor: accentColor || '#000000',
      pages: pages || [],
    });

    return NextResponse.json({ success: true, folktale: newTale });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
