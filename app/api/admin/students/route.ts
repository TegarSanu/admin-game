import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Student } from '@/models/Student';
import mongoose from 'mongoose';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
const APP_API_KEY = process.env.APP_API_KEY || 'belajar_seru_app_secret_key_2026';

// Helper to verify request: returns true if authenticated via cookie OR valid app API key
async function verifyRequest(req: NextRequest, requireFullUserSession = false) {
  // Check API Key first (only if full user session is NOT strictly required)
  const apiKey = req.headers.get('x-app-api-key');
  if (apiKey === APP_API_KEY && !requireFullUserSession) {
    return { success: true, authType: 'api_key' };
  }

  // Check auth_token cookie
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return { success: false, error: 'Unauthorized: Token tidak ditemukan' };
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return { success: true, authType: 'user_session', user: payload };
  } catch (err) {
    return { success: false, error: 'Unauthorized: Sesi tidak valid atau kedaluwarsa' };
  }
}

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all registered student profiles. Filters data based on authenticated role.
 *     tags:
 *       - Students
 *     responses:
 *       200:
 *         description: List of students
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyRequest(req);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    await connectToDatabase();

    // Data isolation based on role or request query
    let filter: any = {};

    if (authResult.authType === 'user_session' && authResult.user) {
      const user = authResult.user as any;
      const roleName = user.role?.name;
      if (roleName === 'Orang Tua') {
        // Parents can ONLY see their children
        filter.parentId = user.id;
      }
    } else if (authResult.authType === 'api_key') {
      // Mobile app without logged in parent
      const { searchParams } = new URL(req.url);
      const ids = searchParams.get('ids');
      if (ids) {
        // Only return students matching the IDs on this device
        const idList = ids.split(',').filter(id => mongoose.Types.ObjectId.isValid(id));
        filter._id = { $in: idList };
      } else {
        // Prevent bulk leaks: return empty array if no query parameter ids is specified
        return NextResponse.json({ success: true, students: [] });
      }
    }

    const students = await Student.find(filter);
    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/students:
 *   post:
 *     summary: Handle student actions (Create, Claim, Reset, Update)
 *     description: Perform operations on student profiles such as registration, claiming pocket money rewards, resetting savings, or updating scores.
 *     tags:
 *       - Students
 *     responses:
 *       200:
 *         description: Action processed successfully
 *       400:
 *         description: Invalid action or missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { action } = body;

    // 1. Handlers requiring user session OR app API key
    if (action === 'create') {
      const authResult = await verifyRequest(req);
      if (!authResult.success) {
        return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
      }

      const { student } = body;
      if (!student || !student.username || !student.name || !student.birthDate || !student.parentEmail) {
        return NextResponse.json({ success: false, error: "Missing required student fields (username, name, birthDate, parentEmail)" }, { status: 400 });
      }

      // Check for duplicate username
      const existingStudent = await Student.findOne({ username: student.username.toLowerCase().trim() });
      if (existingStudent) {
        return NextResponse.json({ success: false, error: "Username sudah digunakan!" }, { status: 400 });
      }

      // Validate parent email and check relation
      const User = mongoose.models.User || require('@/models/User').default;
      const Role = mongoose.models.Role || require('@/models/Role').Role;

      const parentRole = await Role.findOne({ name: 'Orang Tua' });
      const parentUser = await User.findOne({
        email: student.parentEmail.toLowerCase().trim(),
        role: parentRole?._id
      });

      if (!parentUser) {
        return NextResponse.json({ success: false, error: "Email orang tua belum terdaftar oleh Guru!" }, { status: 400 });
      }

      // If user session is parent, verify they are registering using their own email
      if (authResult.authType === 'user_session' && authResult.user) {
        const user = authResult.user as any;
        const roleName = user.role?.name;
        if (roleName === 'Orang Tua' && user.email.toLowerCase().trim() !== student.parentEmail.toLowerCase().trim()) {
          return NextResponse.json({ success: false, error: "Forbidden: Anda tidak dapat menggunakan email orang tua lain" }, { status: 403 });
        }
      }

      // Dynamically calculate age and gradeId from birthDate
      const birth = new Date(student.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      let gradeId = 'tk_a';
      if (age === 5) {
        gradeId = 'tk_b';
      } else if (age === 6) {
        gradeId = 'sd_1';
      } else if (age === 7) {
        gradeId = 'sd_2';
      } else if (age === 8) {
        gradeId = 'sd_3';
      } else if (age === 9) {
        gradeId = 'sd_4';
      } else if (age === 10) {
        gradeId = 'sd_5';
      } else if (age === 11 || age === 12) {
        gradeId = 'sd_6';
      } else if (age === 13) {
        gradeId = 'smp_1';
      } else if (age === 14) {
        gradeId = 'smp_2';
      } else if (age >= 15) {
        gradeId = 'smp_3';
      }

      const newStudent = await Student.create({
        username: student.username.toLowerCase().trim(),
        name: student.name,
        avatar: student.avatar || '🧒',
        gradeId: gradeId,
        birthDate: birth,
        age: age,
        stars: 0,
        badges: [],
        unclaimedRupiah: 0,
        claimedRupiah: 0,
        parentEmail: student.parentEmail.toLowerCase().trim(),
        parentId: parentUser._id,
        // Accept custom configuration if passed at creation
        pointsPerCorrect: student.pointsPerCorrect ? Number(student.pointsPerCorrect) : undefined,
        maxRupiahLimit: student.maxRupiahLimit ? Number(student.maxRupiahLimit) : undefined
      });
      return NextResponse.json({ success: true, student: newStudent });
    }

    if (action === 'import') {
      const authResult = await verifyRequest(req);
      if (!authResult.success) {
        return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
      }

      const { username, parentEmail } = body;
      if (!username || !parentEmail) {
        return NextResponse.json({ success: false, error: "Username dan email orang tua wajib diisi!" }, { status: 400 });
      }

      // If user session is parent, verify they are importing their own children
      if (authResult.authType === 'user_session' && authResult.user) {
        const user = authResult.user as any;
        const roleName = user.role?.name;
        if (roleName === 'Orang Tua' && user.email.toLowerCase().trim() !== parentEmail.toLowerCase().trim()) {
          return NextResponse.json({ success: false, error: "Forbidden: Anda hanya dapat mengimpor profil anak Anda sendiri" }, { status: 403 });
        }
      }

      const existingStudent = await Student.findOne({ 
        username: username.toLowerCase().trim(), 
        parentEmail: parentEmail.toLowerCase().trim() 
      });

      if (!existingStudent) {
        return NextResponse.json({ success: false, error: "Profil anak tidak ditemukan! Silakan periksa kembali username dan email orang tua." }, { status: 404 });
      }

      return NextResponse.json({ success: true, student: existingStudent });
    }

    const { studentId } = body;
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    // 2. Handlers requiring app API key or user session (updates score/progress/unclaimed reward)
    if (action === 'update') {
      const authResult = await verifyRequest(req);
      if (!authResult.success) {
        return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
      }

      const { updates } = body;
      if (!updates) {
        return NextResponse.json({ success: false, error: "Missing updates object" }, { status: 400 });
      }

      // Apply updates
      if (typeof updates.stars === 'number') student.stars = updates.stars;
      if (Array.isArray(updates.badges)) student.badges = updates.badges;
      if (typeof updates.unclaimedRupiah === 'number') student.unclaimedRupiah = updates.unclaimedRupiah;
      if (typeof updates.claimedRupiah === 'number') student.claimedRupiah = updates.claimedRupiah;
      if (Array.isArray(updates.unlockedStickers)) student.unlockedStickers = updates.unlockedStickers;
      if (updates.gameProgress) student.gameProgress = updates.gameProgress;
      
      // Update custom configurations if passed by parent/teacher
      if (updates.pointsPerCorrect !== undefined) student.pointsPerCorrect = updates.pointsPerCorrect === null ? undefined : Number(updates.pointsPerCorrect);
      if (updates.maxRupiahLimit !== undefined) student.maxRupiahLimit = updates.maxRupiahLimit === null ? undefined : Number(updates.maxRupiahLimit);

      await student.save();
      return NextResponse.json({ success: true, student });
    }

    // 3. Handlers strictly requiring parent/teacher/admin session (claims & reset)
    if (action === 'claim' || action === 'reset') {
      const authResult = await verifyRequest(req, true); // requireFullUserSession = true
      if (!authResult.success) {
        return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
      }

      // If user session is parent, verify they own this student
      if (authResult.user) {
        const user = authResult.user as any;
        if (user.role?.name === 'Orang Tua') {
          if (student.parentId.toString() !== user.id) {
            return NextResponse.json({ success: false, error: "Forbidden: Anda bukan orang tua dari murid ini" }, { status: 403 });
          }
        }
      }

      if (action === 'claim') {
        const unclaimed = student.unclaimedRupiah || 0;
        student.claimedRupiah = (student.claimedRupiah || 0) + unclaimed;
        student.unclaimedRupiah = 0;
        await student.save();
      } else if (action === 'reset') {
        student.claimedRupiah = 0;
        await student.save();
      }

      return NextResponse.json({ success: true, student });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
