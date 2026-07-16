import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch only active games
    const games = await Game.find({ isActive: true });

    // Format matches the output the game client expects
    const responseData: Record<string, any> = {};
    games.forEach((game) => {
      responseData[game.gameId] = {
        name: game.name,
        icon: game.icon,
        difficultyRating: game.difficultyRating,
        difficultyByGrade: game.difficultyByGrade,
        questionPool: game.questionPool,
        ...(game.gameId === 'memory' ? { cardPool: game.questionPool } : {})
      };
    });

    return NextResponse.json({
      success: true,
      games: responseData,
    });
  } catch (error: any) {
    console.error('Error fetching client games data:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
