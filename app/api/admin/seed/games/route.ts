import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';

export async function GET() {
  try {
    await connectToDatabase();

    // Directory of game json files in TestGameApps
    const gamesDataDir = '/home/tki/Documents/Coba/TestGameApps/src/data/games';
    
    if (!fs.existsSync(gamesDataDir)) {
      return NextResponse.json({
        success: false,
        error: `Games data directory not found at: ${gamesDataDir}`,
      }, { status: 404 });
    }

    const files = fs.readdirSync(gamesDataDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const seededGames = [];

    for (const file of jsonFiles) {
      const filePath = path.join(gamesDataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const gameData = JSON.parse(fileContent);

      const gameId = path.basename(file, '.json');

      // Delete if already exists to fresh seed
      await Game.deleteOne({ gameId });

      const newGame = await Game.create({
        gameId,
        name: gameData.name || gameId,
        icon: gameData.icon || '🎮',
        difficultyRating: gameData.difficultyRating || 1,
        difficultyByGrade: gameData.difficultyByGrade || {},
        questionPool: gameData.questionPool || [],
        isActive: true,
      });

      seededGames.push({
        gameId,
        name: newGame.name,
        questionsCount: newGame.questionPool.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Games seeded successfully!',
      count: seededGames.length,
      games: seededGames,
    });
  } catch (error: any) {
    console.error('Error seeding games:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
