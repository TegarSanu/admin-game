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
      // Seed default roles
      const defaultRoles = [
        {
          name: 'Administrator',
          description: 'Full system access with all permissions enabled.',
          isSystem: true,
          permissions: {
            users: ['read', 'write', 'delete'],
            crm: ['read', 'write', 'delete'],
            analytics: ['read', 'write', 'delete'],
            media: ['read', 'write', 'delete'],
            settings: ['read', 'write', 'delete'],
          }
        },
        {
          name: 'Editor',
          description: 'Can manage data but cannot access system settings.',
          isSystem: true,
          permissions: {
            users: ['read', 'write'],
            crm: ['read', 'write'],
            analytics: ['read'],
            media: ['read', 'write'],
            settings: ['read'],
          }
        },
        {
          name: 'Viewer',
          description: 'Read-only access across the entire platform.',
          isSystem: true,
          permissions: {
            users: ['read'],
            crm: ['read'],
            analytics: ['read'],
            media: ['read'],
            settings: ['read'],
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
