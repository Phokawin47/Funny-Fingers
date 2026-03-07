import mongoose from "mongoose";
import { NextResponse } from "next/server";

function maskMongoUri(uri: string) {
  // ซ่อน user:pass
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
}

export async function GET() {
  const uri = process.env.MONGODB_URI;

  // ✅ ถ้า undefined = Next ไม่ได้อ่าน env แน่นอน
  if (!uri) {
    return NextResponse.json(
      {
        ok: false,
        error: "MONGODB_URI is undefined (Next.js is not reading your env file)",
      },
      { status: 500 }
    );
  }

  await mongoose.connect(uri);

  const client = mongoose.connection.getClient();
  const db = client.db();

  const cols = await db.listCollections().toArray();

  return NextResponse.json({
    ok: true,
    mongoUriMasked: maskMongoUri(uri),
    uriDbHint: uri.match(/\/([^/?]+)(\?|$)/)?.[1] ?? null,
    dbName: db.databaseName,
    collections: cols.map((c) => c.name).sort(),
  });
}