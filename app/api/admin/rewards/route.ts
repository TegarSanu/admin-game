import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { RewardConfig } from '@/models/RewardConfig';

// Default list of grades to seed if empty
const GRADE_IDS = [
  "tk_a", "tk_b", "sd_1", "sd_2", "sd_3", "sd_4", "sd_5", "sd_6", "smp_1", "smp_2", "smp_3"
];

export async function GET() {
  try {
    await connectToDatabase();
    let configs = await RewardConfig.find({});
    
    // Seed if none exist
    if (configs.length === 0) {
      const defaultConfigs = GRADE_IDS.map(g => ({
        gradeId: g,
        pointsPerCorrect: 300,
        maxRupiahLimit: g.startsWith("tk") ? 2000 : g.startsWith("sd") ? 3000 : 5000
      }));
      configs = await RewardConfig.insertMany(defaultConfigs);
    }
    
    return NextResponse.json({ success: true, configs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const { configs } = await req.json();
    
    if (!Array.isArray(configs)) {
      return NextResponse.json({ success: false, error: "Invalid configs payload" }, { status: 400 });
    }
    
    for (const cfg of configs) {
      await RewardConfig.findOneAndUpdate(
        { gradeId: cfg.gradeId },
        { pointsPerCorrect: cfg.pointsPerCorrect, maxRupiahLimit: cfg.maxRupiahLimit },
        { upsert: true }
      );
    }
    
    return NextResponse.json({ success: true, message: "Reward configurations saved successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { gradeId, pointsPerCorrect, maxRupiahLimit } = await req.json();

    if (!gradeId || !gradeId.trim()) {
      return NextResponse.json({ success: false, error: "gradeId (ID Kelas) wajib diisi!" }, { status: 400 });
    }

    const formattedGradeId = gradeId.toLowerCase().trim().replace(/\s+/g, '_');

    // Validation for duplicate gradeId
    const duplicate = await RewardConfig.findOne({ gradeId: formattedGradeId });
    if (duplicate) {
      return NextResponse.json({ success: false, error: "Kelas dengan ID tersebut sudah terdaftar!" }, { status: 400 });
    }

    const newConfig = await RewardConfig.create({
      gradeId: formattedGradeId,
      pointsPerCorrect: Number(pointsPerCorrect) || 300,
      maxRupiahLimit: Number(maxRupiahLimit) || 2000
    });

    return NextResponse.json({ success: true, config: newConfig });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const gradeId = searchParams.get('gradeId');

    if (!gradeId) {
      return NextResponse.json({ success: false, error: "gradeId parameter is required" }, { status: 400 });
    }

    const deleted = await RewardConfig.findOneAndDelete({ gradeId: gradeId });
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Kelas berhasil dihapus!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
