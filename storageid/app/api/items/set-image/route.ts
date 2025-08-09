// app/api/items/set-image/route.ts
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db/prisma";

export async function POST(req: Request) {
  const { itemId, url } = await req.json();
  if (!itemId || !url) {
    return NextResponse.json({ ok: false, error: "Missing itemId or url" }, { status: 400 });
  }

  await prisma.item.update({
    where: { id: itemId },
    data: { imageUrl: url },
  });

  return NextResponse.json({ ok: true });
}
