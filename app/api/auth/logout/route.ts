import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Clears the auth_token cookie.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logout successful, clears auth_token cookie
 */
export async function POST() {
  const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
