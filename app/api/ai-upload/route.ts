import { NextResponse } from "next/server";
import Anthropic, { toFile } from "@anthropic-ai/sdk";
import { getDbUser } from "@/lib/getDbUser";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const dbUser = await getDbUser();
  if (!dbUser) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Format non supporté (JPEG, PNG, WEBP, PDF uniquement)" }, { status: 415 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await client.beta.files.upload(
    { file: await toFile(buffer, file.name, { type: file.type }) },
    { headers: { "anthropic-beta": "files-api-2025-04-14" } }
  );

  return NextResponse.json({ fileId: uploaded.id, mediaType: file.type });
}
