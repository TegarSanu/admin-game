import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Student } from '@/models/Student';

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all registered student profiles.
 *     tags:
 *       - Students
 *     responses:
 *       200:
 *         description: List of students
 *       500:
 *         description: Server error
 *   post:
 *     summary: Handle student actions (Create, Claim, Reset, Update)
 *     description: Perform operations on student profiles such as registration, claiming pocket money rewards, resetting savings, or updating scores.
 *     tags:
 *       - Students
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [create, claim, reset, update]
 *                 description: The action to execute
 *               student:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   gradeId:
 *                     type: string
 *                   age:
 *                     type: integer
 *               studentId:
 *                 type: string
 *                 description: Mongoose ObjectId of the student
 *               updates:
 *                 type: object
 *                 properties:
 *                   stars:
 *                     type: integer
 *                   badges:
 *                     type: array
 *                     items:
 *                       type: string
 *                   unclaimedRupiah:
 *                     type: integer
 *                   claimedRupiah:
 *                     type: integer
 *                   unlockedStickers:
 *                     type: array
 *                     items:
 *                       type: string
 *                   gameProgress:
 *                     type: object
 *     responses:
 *       200:
 *         description: Action processed successfully
 *       400:
 *         description: Invalid action or missing required fields
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */

export async function GET() {
  try {
    await connectToDatabase();
    const students = await Student.find({});
    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
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
        parentId: parentUser._id
      });
      return NextResponse.json({ success: true, student: newStudent });
    }

    if (action === 'import') {
      const { username, parentEmail } = body;
      if (!username || !parentEmail) {
        return NextResponse.json({ success: false, error: "Username dan email orang tua wajib diisi!" }, { status: 400 });
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
    
    if (action === 'claim') {
      const unclaimed = student.unclaimedRupiah || 0;
      student.claimedRupiah = (student.claimedRupiah || 0) + unclaimed;
      student.unclaimedRupiah = 0;
      await student.save();
    } else if (action === 'reset') {
      student.claimedRupiah = 0;
      await student.save();
    } else if (action === 'update') {
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
      await student.save();
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
