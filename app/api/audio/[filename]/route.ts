import mongoose from "mongoose";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await ctx.params;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return new Response(JSON.stringify({ error: "MONGODB_URI is undefined" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
    }

    const db = mongoose.connection.getClient().db();
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "audioFiles" });

    const files = await bucket.find({ filename }).toArray();
    if (!files.length) {
      return new Response(
        JSON.stringify({ error: "File not found", filename, dbName: db.databaseName }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const fileAny = files[0] as any;
    const contentType = fileAny.contentType || fileAny.metadata?.contentType || "audio/mpeg";

    const downloadStream = bucket.openDownloadStreamByName(filename);

    return new Response(downloadStream as any, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileAny.length ?? ""),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}