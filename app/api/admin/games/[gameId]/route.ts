import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';

/**
 * @swagger
 * /api/admin/games/{gameId}:
 *   get:
 *     summary: Retrieve game details
 *     description: Retrieve detailed configurations and the question pool of a specific game using its unique string ID.
 *     tags:
 *       - Games
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: Game string ID (e.g. mathBalloonPop)
 *     responses:
 *       200:
 *         description: Game details object
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update game configurations
 *     description: Modify name, icon, difficulty ratings, or question pool of an existing game.
 *     tags:
 *       - Games
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: Game string ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               difficultyRating:
 *                 type: integer
 *               difficultyByGrade:
 *                 type: object
 *               questionPool:
 *                 type: array
 *                 items:
 *                   type: object
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Game updated successfully
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a game
 *     description: Delete a game configuration and its question pool completely.
 *     tags:
 *       - Games
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: Game string ID
 *     responses:
 *       200:
 *         description: Game deleted successfully
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    await connectToDatabase();
    const { gameId } = await params;

    const game = await Game.findOne({ gameId });
    if (!game) {
      return NextResponse.json({
        success: false,
        error: 'Game not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error: any) {
    console.error(`Error fetching game detail:`, error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    await connectToDatabase();
    const { gameId } = await params;
    const body = await request.json();

    const game = await Game.findOne({ gameId });
    if (!game) {
      return NextResponse.json({
        success: false,
        error: 'Game not found',
      }, { status: 404 });
    }

    // Update fields if provided
    if (body.name !== undefined) game.name = body.name;
    if (body.icon !== undefined) game.icon = body.icon;
    if (body.difficultyRating !== undefined) game.difficultyRating = body.difficultyRating;
    if (body.difficultyByGrade !== undefined) game.difficultyByGrade = body.difficultyByGrade;
    if (body.questionPool !== undefined) game.questionPool = body.questionPool;
    if (body.isActive !== undefined) game.isActive = body.isActive;

    await game.save();

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error: any) {
    console.error(`Error updating game:`, error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    await connectToDatabase();
    const { gameId } = await params;

    const result = await Game.deleteOne({ gameId });
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Game not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Game deleted successfully',
    });
  } catch (error: any) {
    console.error(`Error deleting game:`, error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
