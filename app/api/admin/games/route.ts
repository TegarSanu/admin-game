/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';

/**
 * @swagger
 * /api/admin/games:
 *   get:
 *     summary: Get all games
 *     description: Retrieve all active and inactive games with their properties and the number of questions in their pool.
 *     tags:
 *       - Games
 *     responses:
 *       200:
 *         description: List of games
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new game
 *     description: Add a new game configuration to the admin dashboard database.
 *     tags:
 *       - Games
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - name
 *             properties:
 *               gameId:
 *                 type: string
 *                 description: Unique string identifier (e.g. mathBalloonPop)
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               difficultyRating:
 *                 type: integer
 *               difficultyByGrade:
 *                 type: object
 *     responses:
 *       200:
 *         description: Game created successfully
 *       400:
 *         description: gameId and name are required or game already exists
 *       500:
 *         description: Server error
 */

export async function GET() {
  try {
    await connectToDatabase();
    
    const games = await Game.aggregate([
      {
        $project: {
          gameId: 1,
          name: 1,
          icon: 1,
          difficultyRating: 1,
          isActive: 1,
          difficultyByGrade: 1,
          createdAt: 1,
          updatedAt: 1,
          questionsCount: { $size: "$questionPool" }
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      games,
    });
  } catch (error: any) {
    console.error('Error fetching admin games:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { gameId, name, icon, difficultyRating, difficultyByGrade } = body;

    if (!gameId || !name) {
      return NextResponse.json({
        success: false,
        error: 'gameId and name are required',
      }, { status: 400 });
    }

    const existing = await Game.findOne({ gameId });
    if (existing) {
      return NextResponse.json({
        success: false,
        error: `Game with id ${gameId} already exists`,
      }, { status: 400 });
    }

    const newGame = await Game.create({
      gameId,
      name,
      icon: icon || '🎮',
      difficultyRating: difficultyRating || 1,
      difficultyByGrade: difficultyByGrade || {},
      questionPool: [],
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      game: newGame,
    });
  } catch (error: any) {
    console.error('Error creating admin game:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
