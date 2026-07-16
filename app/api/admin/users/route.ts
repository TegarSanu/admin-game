import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { Role } from "@/models/Role";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    let filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        filter.role = roleDoc._id;
      }
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    let query = User.find(filter).populate('role').sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }

    const users = await query;
    const total = await User.countDocuments(filter);

    const formattedUsers = users.map((user: any) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role?.name || 'Unknown',
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return NextResponse.json({ users: formattedUsers, total });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);

    let finalRole = body.role;
    if (!finalRole) {
      const defaultRole = await Role.findOne({ name: 'User' });
      finalRole = defaultRole?._id;
    }

    const newUser = await User.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: finalRole,
      status: body.status || "Active",
    });

    const populatedUser = await User.findById(newUser._id).populate('role');

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: populatedUser?._id.toString(),
          name: populatedUser?.name,
          email: populatedUser?.email,
          role: populatedUser?.role?.name || 'Unknown',
          status: populatedUser?.status,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Failed to create user:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
