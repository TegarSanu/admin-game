import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { Role } from '@/models/Role';

/**
 * @swagger
 * /api/auth/validate-parent:
 *   get:
 *     summary: Validate parent email
 *     description: Checks if a given email is registered and belongs to a user with the 'Orang Tua' (Parent) role.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: The email of the parent to validate
 *     responses:
 *       200:
 *         description: Parent email is valid
 *       400:
 *         description: Bad request (missing email)
 *       404:
 *         description: Parent email not found or does not have 'Orang Tua' role
 *       500:
 *         description: Internal Server Error
 */
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email wajib diisi!' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the 'Orang Tua' role
    const parentRole = await Role.findOne({ name: 'Orang Tua' });
    if (!parentRole) {
      return NextResponse.json(
        { success: false, error: 'Role Orang Tua tidak ditemukan di sistem!' },
        { status: 500 }
      );
    }

    // Find the user with the email and the parent role
    const parentUser = await User.findOne({
      email: normalizedEmail,
      role: parentRole._id,
    });

    if (!parentUser) {
      return NextResponse.json(
        { success: false, error: 'Email orang tua belum terdaftar oleh Guru!' },
        { status: 404 }
      );
    }

    if (parentUser.status !== 'Active') {
      return NextResponse.json(
        { success: false, error: 'Akun orang tua ini sedang tidak aktif!' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email orang tua valid',
      parent: {
        id: parentUser._id,
        name: parentUser.name,
        email: parentUser.email,
      },
    });
  } catch (error: any) {
    console.error('Validate Parent Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
