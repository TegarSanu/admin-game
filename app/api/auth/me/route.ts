import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { Role } from '@/models/Role'; // Need to import to populate

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

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_key_change_in_production'
    );

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
