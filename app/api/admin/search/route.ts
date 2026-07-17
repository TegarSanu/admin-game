import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Game from "@/models/Game";
import FolkTale from "@/models/FolkTale";
import Sticker from "@/models/Sticker";
import { Student } from "@/models/Student";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({
        users: [],
        games: [],
        folktales: [],
        stickers: [],
        students: [],
      });
    }

    const searchRegex = { $regex: query, $options: "i" };

    // Run queries in parallel
    const [users, games, folktales, stickers, students] = await Promise.all([
      User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).limit(5),
      Game.find({
        $or: [{ name: searchRegex }, { gameId: searchRegex }],
      }).limit(5),
      FolkTale.find({
        $or: [{ title: searchRegex }, { region: searchRegex }],
      }).limit(5),
      Sticker.find({
        $or: [{ name: searchRegex }, { stickerId: searchRegex }],
      }).limit(5),
      Student.find({
        $or: [{ name: searchRegex }, { username: searchRegex }],
      }).limit(5),
    ]);

    return NextResponse.json({
      users,
      games,
      folktales,
      stickers,
      students,
    });
  } catch (error: any) {
    console.error("Global search API error:", error);
    return NextResponse.json(
      { error: "Failed to perform global search", details: error.message },
      { status: 500 }
    );
  }
}
