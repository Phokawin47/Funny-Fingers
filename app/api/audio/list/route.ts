import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }

  const db = mongoose.connection.getClient().db();
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "audioFiles" });

  const files = await bucket.find({}).sort({ uploadDate: -1 }).limit(30).toArray();
  return NextResponse.json(
    files.map((f: any) => ({
      filename: f.filename,
      length: f.length,
      contentType: f.contentType,
      uploadDate: f.uploadDate,
    }))
  );
}