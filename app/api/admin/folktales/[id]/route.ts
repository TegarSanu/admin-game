import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import FolkTale from '@/models/FolkTale';

/**
 * @swagger
 * /api/admin/folktales/{id}:
 *   get:
 *     summary: Get folk tale details
 *     description: Retrieve detailed information of a specific folk tale by its string ID.
 *     tags:
 *       - Folk Tales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Folk tale string ID (e.g. timun_mas)
 *     responses:
 *       200:
 *         description: Folk tale object
 *       404:
 *         description: Folk tale not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update folk tale details
 *     description: Modify details or pages of an existing folk tale.
 *     tags:
 *       - Folk Tales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Folk tale string ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *                   properties:
 *                     text:
 *                       type: string
 *                     illustrationKey:
 *                       type: string
 *                     bgColor:
 *                       type: string
 *     responses:
 *       200:
 *         description: Folk tale updated successfully
 *       404:
 *         description: Folk tale not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a folk tale
 *     description: Permanently remove a folk tale from the database.
 *     tags:
 *       - Folk Tales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Folk tale string ID
 *     responses:
 *       200:
 *         description: Folk tale deleted successfully
 *       404:
 *         description: Folk tale not found
 *       500:
 *         description: Server error
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const folktale = await FolkTale.findOne({ id });
    if (!folktale) {
      return NextResponse.json({ success: false, error: 'Cerita tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, folktale });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const { title, icon, region, coverColor, accentColor, pages } = body;

    const folktale = await FolkTale.findOne({ id });
    if (!folktale) {
      return NextResponse.json({ success: false, error: 'Cerita tidak ditemukan' }, { status: 404 });
    }

    if (title !== undefined) folktale.title = title;
    if (icon !== undefined) folktale.icon = icon;
    if (region !== undefined) folktale.region = region;
    if (coverColor !== undefined) folktale.coverColor = coverColor;
    if (accentColor !== undefined) folktale.accentColor = accentColor;
    if (pages !== undefined) folktale.pages = pages;

    await folktale.save();
    return NextResponse.json({ success: true, folktale });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const result = await FolkTale.deleteOne({ id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Cerita tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Cerita berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
