import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureCatalog } from "@/db/ensure";
import { media } from "@/db/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureCatalog();
  const { id } = await params;
  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (!row) return new Response("Introuvable", { status: 404 });
  const bytes = Buffer.from(row.data, "base64");
  return new Response(bytes, {
    headers: {
      "Content-Type": row.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
