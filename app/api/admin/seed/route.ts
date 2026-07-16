import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { Role } from '@/models/Role';
import Game from '@/models/Game';
import { Student } from '@/models/Student';
import { RewardConfig } from '@/models/RewardConfig';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Clear existing user, role, student, and reward config data
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Student.deleteMany({}),
      RewardConfig.deleteMany({})
    ]);

    // 2. Create Roles as requested by the user
    const rolesData = [
      {
        name: 'Super Admin',
        description: 'Akses penuh ke semua modul dan konfigurasi sistem.',
        permissions: {
          users: ['read', 'write', 'delete'],
          games: ['read', 'write', 'delete'],
          grades: ['read', 'write', 'delete'],
          rewards: ['read', 'write', 'delete'],
        },
        isSystem: true
      },
      {
        name: 'Guru',
        description: 'Manajemen soal, nilai murid, manajemen game, dan config hadiah.',
        permissions: {
          games: ['read', 'write', 'delete'],
          grades: ['read', 'write'],
          rewards: ['read', 'write'],
        },
        isSystem: false
      },
      {
        name: 'Orang Tua',
        description: 'Akses aplikasi game dan manajemen soal admin.',
        permissions: {
          games: ['read', 'write'],
          game_app: ['read'],
        },
        isSystem: false
      },
      {
        name: 'Murid',
        description: 'Hanya memiliki akses untuk memainkan aplikasi game.',
        permissions: {
          game_app: ['read'],
        },
        isSystem: false
      },
    ];
    const createdRoles = await Role.insertMany(rolesData);
    const superAdminRole = createdRoles.find(r => r.name === 'Super Admin')?._id;
    const guruRole = createdRoles.find(r => r.name === 'Guru')?._id;
    const orangTuaRole = createdRoles.find(r => r.name === 'Orang Tua')?._id;
    const muridRole = createdRoles.find(r => r.name === 'Murid')?._id;

    // 3. Create Users
    const defaultPassword = await bcrypt.hash('password123', 10);
    const usersData = [
      { name: 'Super Admin', email: 'admin@example.com', password: defaultPassword, role: superAdminRole, status: 'Active' },
      { name: 'Budi Parent', email: 'ortu@example.com', password: defaultPassword, role: orangTuaRole, status: 'Active' },
    ];
    const createdUsers = await User.insertMany(usersData);
    const parentUser = createdUsers.find(u => u.email === 'ortu@example.com');

    // 4. Seed Default Students
    const defaultStudents = [
      { 
        username: "adit", 
        name: "Adit Pratama", 
        avatar: "🧒", 
        gradeId: "sd_1", 
        birthDate: new Date('2019-05-15'), 
        age: 7, 
        stars: 12, 
        badges: ["Bintang Pemula"], 
        unclaimedRupiah: 3600, 
        claimedRupiah: 15000, 
        parentEmail: "ortu@example.com", 
        parentId: parentUser?._id 
      },
      { 
        username: "siti", 
        name: "Siti Rahma", 
        avatar: "👧", 
        gradeId: "tk_b", 
        birthDate: new Date('2021-08-20'), 
        age: 5, 
        stars: 6, 
        badges: ["Bintang Pemula"], 
        unclaimedRupiah: 1200, 
        claimedRupiah: 6000, 
        parentEmail: "ortu@example.com", 
        parentId: parentUser?._id 
      },
      { 
        username: "budi", 
        name: "Budi Santoso", 
        avatar: "👦", 
        gradeId: "sd_4", 
        birthDate: new Date('2016-02-10'), 
        age: 10, 
        stars: 32, 
        badges: ["Bintang Pemula", "Jagoan Belajar", "Master Kecil"], 
        unclaimedRupiah: 0, 
        claimedRupiah: 45000, 
        parentEmail: "ortu@example.com", 
        parentId: parentUser?._id 
      },
    ];
    await Student.insertMany(defaultStudents);

    // 5. Seed Default Reward Configs
    const GRADE_IDS = [
      "tk_a", "tk_b", "sd_1", "sd_2", "sd_3", "sd_4", "sd_5", "sd_6", "smp_1", "smp_2", "smp_3"
    ];
    const defaultConfigs = GRADE_IDS.map(g => ({
      gradeId: g,
      pointsPerCorrect: 300,
      maxRupiahLimit: g.startsWith("tk") ? 2000 : g.startsWith("sd") ? 3000 : 5000
    }));
    await RewardConfig.insertMany(defaultConfigs);

    return NextResponse.json({ 
      success: true, 
      message: 'Roles, users, students, and reward configs seeded successfully!',
      stats: {
        roles: createdRoles.length,
        users: createdUsers.length,
        students: defaultStudents.length,
        configs: defaultConfigs.length
      }
    });

  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
