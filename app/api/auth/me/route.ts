import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { Role } from '@/models/Role'; // Need to import to populate
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user details
 *     description: Reads JWT token from auth_token cookie and returns the user object with latest permissions.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Current user details retrieved successfully
 *       401:
 *         description: Unauthorized (missing, expired or invalid token, or user not found)
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is missing!');
    }
    const secret = new TextEncoder().encode(jwtSecret);

    const { payload } = await jwtVerify(token, secret);

    await connectToDatabase();
    
    // Always fetch latest permissions from DB to keep it real-time
    const user = await User.findById(payload.id).populate({ path: 'role', model: Role }).select('-password');

    if (!user) {
      const response = NextResponse.json({ error: 'User not found' }, { status: 401 });
      response.cookies.set({
        name: 'auth_token',
        value: '',
        httpOnly: true,
        expires: new Date(0),
        path: '/',
      });
      return response;
    }

    const roleData = user.role ? { name: user.role.name, permissions: user.role.permissions } : { name: 'User', permissions: {} };

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleData,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Auth Me Error:', error);
    const response = NextResponse.json({ error: 'Unauthorized or Token Expired' }, { status: 401 });
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
    return response;
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is missing!');
    }
    const secret = new TextEncoder().encode(jwtSecret);

    const { payload } = await jwtVerify(token, secret);

    await connectToDatabase();
    
    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Nama dan Email harus diisi' }, { status: 400 });
    }

    // Find the user with password selected for password change verification
    const user = await User.findById(payload.id).select('+password').populate({ path: 'role', model: Role });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Check if email already exists for another user
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({ error: 'Email sudah terdaftar oleh pengguna lain' }, { status: 400 });
      }
      user.email = email.toLowerCase();
    }

    user.name = name;

    // Check password change request
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Password saat ini harus diisi untuk mengubah password' }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password baru minimal harus 6 karakter' }, { status: 400 });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const roleData = user.role ? { name: user.role.name, permissions: user.role.permissions } : { name: 'User', permissions: {} };

    // Regenerate Token
    const newToken = await new SignJWT({ 
        id: user._id.toString(), 
        email: user.email,
        role: roleData
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    const response = NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleData,
      }
    }, { status: 200 });

    response.cookies.set({
      name: 'auth_token',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Update Auth Me Error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
}
