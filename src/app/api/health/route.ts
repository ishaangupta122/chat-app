import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET() {
  try {
    const result = await db.query("SELECT NOW();");

    return NextResponse.json({
      status: "ok",
      database: "connected",
      dbResponse: result.rows[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
