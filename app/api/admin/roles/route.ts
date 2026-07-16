import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Role } from '@/models/Role';

/**
 * @swagger
 * /api/admin/roles:
 *   get:
 *     summary: Retrieve roles
 *     description: Returns a list of roles, sorted system roles first, then alphabetically. If none exist, seeds default ones.
 *     tags:
 *       - Roles
 *     responses:
 *       200:
 *         description: A list of roles
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    await connectToDatabase();
    let roles = await Role.find({}).sort({ isSystem: -1, name: 1 });
    
    if (roles.length === 0) {
      // Seed default roles matching Dunia Pintar admin features
      const defaultRoles = [
        {
          name: 'Super Admin',
          description: 'Akses penuh ke semua modul dan konfigurasi sistem.',
          isSystem: true,
          permissions: {
            users: ['read', 'write', 'delete'],
            games: ['read', 'write', 'delete'],
            grades: ['read', 'write', 'delete'],
            rewards: ['read', 'write', 'delete'],
            folktales: ['read', 'write', 'delete'],
            stickers: ['read', 'write', 'delete'],
            game_app: ['read', 'write', 'delete'],
          }
        },
        {
          name: 'Guru',
          description: 'Manajemen soal, nilai murid, cerita rakyat, stiker, dan config hadiah.',
          isSystem: false,
          permissions: {
            games: ['read', 'write', 'delete'],
            grades: ['read', 'write'],
            rewards: ['read', 'write'],
            folktales: ['read', 'write', 'delete'],
            stickers: ['read', 'write', 'delete'],
            game_app: ['read'],
          }
        },
        {
          name: 'Orang Tua',
          description: 'Akses aplikasi game dan pencairan tabungan anak.',
          isSystem: false,
          permissions: {
            games: ['read'],
            grades: ['read', 'write'],
            game_app: ['read'],
          }
        },
        {
          name: 'Murid',
          description: 'Hanya memiliki akses untuk memainkan aplikasi game.',
          isSystem: false,
          permissions: {
            game_app: ['read'],
          }
        }
      ];
      await Role.insertMany(defaultRoles);
      roles = await Role.find({}).sort({ isSystem: -1, name: 1 });
    }
    
    return NextResponse.json({ roles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/roles:
 *   post:
 *     summary: Create a new role
 *     description: Creates a custom user role with specific module permissions.
 *     tags:
 *       - Roles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: object
 *                 description: Map of modules (e.g. users, crm, analytics) to an array of actions (e.g. ['read', 'write', 'delete'])
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Bad request (validation or input error)
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const role = await Role.create(body);
    return NextResponse.json({ role }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
