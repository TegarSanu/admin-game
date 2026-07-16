import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Game from '@/models/Game';
import { Role } from '@/models/Role';
import FolkTale from '@/models/FolkTale';
import Sticker from '@/models/Sticker';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Aggregations for games and questions
    const totalGames = await Game.countDocuments();
    const activeGames = await Game.countDocuments({ isActive: true });
    
    const games = await Game.find({}, 'questionPool');
    let totalQuestions = 0;
    games.forEach(g => {
      if (Array.isArray(g.questionPool)) {
        totalQuestions += g.questionPool.length;
      }
    });
    
    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'Active' });
    const totalRoles = await Role.countDocuments();

    // FolkTales and Stickers stats
    const totalFolkTales = await FolkTale.countDocuments();
    const totalStickers = await Sticker.countDocuments();

    return NextResponse.json({
      stats: {
        totalGames,
        activeGames,
        totalQuestions,
        totalUsers,
        activeUsers,
        totalRoles,
        totalFolkTales,
        totalStickers
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
