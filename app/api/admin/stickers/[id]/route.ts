import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Sticker from '@/models/Sticker';

/**
 * @swagger
 * /api/admin/stickers/{id}:
 *   get:
 *     summary: Retrieve sticker details
 *     description: Retrieve details of a specific sticker by its unique string identifier (stickerId).
 *     tags:
 *       - Stickers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sticker string ID (e.g. tiger)
 *     responses:
 *       200:
 *         description: Sticker object details
 *       404:
 *         description: Sticker not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update sticker details
 *     description: Modify emoji, name, cost, or card color of an existing reward sticker.
 *     tags:
 *       - Stickers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sticker string ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *         description: Sticker updated successfully
 *       404:
 *         description: Sticker not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a sticker
 *     description: Permanently remove a sticker from the reward catalog.
 *     tags:
 *       - Stickers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sticker string ID
 *     responses:
 *       200:
 *         description: Sticker deleted successfully
 *       404:
 *         description: Sticker not found
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
    const sticker = await Sticker.findOne({ stickerId: id });
    if (!sticker) {
      return NextResponse.json({ success: false, error: 'Stiker tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, sticker });
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
    const { emoji, name, cost, color } = body;

    const sticker = await Sticker.findOne({ stickerId: id });
    if (!sticker) {
      return NextResponse.json({ success: false, error: 'Stiker tidak ditemukan' }, { status: 404 });
    }

    if (emoji !== undefined) sticker.emoji = emoji;
    if (name !== undefined) sticker.name = name;
    if (cost !== undefined) sticker.cost = cost;
    if (color !== undefined) sticker.color = color;

    await sticker.save();
    return NextResponse.json({ success: true, sticker });
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
    const result = await Sticker.deleteOne({ stickerId: id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Stiker tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Stiker berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
