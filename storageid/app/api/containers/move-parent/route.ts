// app/api/containers/move-parent/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma' // adjust alias if you have one

export async function POST(req: Request) {
  try {
    const { containerId, targetContainerId } = await req.json() as {
      containerId?: string
      targetContainerId?: string | null // null/'' means move to root
    }

    if (!containerId) {
      return NextResponse.json({ error: 'Missing containerId' }, { status: 400 })
    }

    // Get the source container (with parent/location to help checks)
    const source = await prisma.container.findUnique({
      where: { id: containerId },
      select: { id: true, parentId: true, locationId: true },
    })
    if (!source) {
      return NextResponse.json({ error: 'Source container not found' }, { status: 404 })
    }

    // Normalize target
    const targetId = targetContainerId && targetContainerId !== '' ? targetContainerId : null

    // Disallow moving into itself
    if (targetId === source.id) {
      return NextResponse.json({ error: 'Cannot move a container into itself' }, { status: 400 })
    }

    // If targeting another container, fetch it
    let target: { id: string; parentId: string | null; locationId: string | null } | null = null
    if (targetId) {
      target = await prisma.container.findUnique({
        where: { id: targetId },
        select: { id: true, parentId: true, locationId: true },
      })
      if (!target) {
        return NextResponse.json({ error: 'Target container not found' }, { status: 404 })
      }

      // Cycle check: ensure target is not a descendant of source
      // Walk up the parent chain of target; if we hit source.id -> cycle
      let cursor: string | null = target.parentId
      // limit to avoid infinite loops in corrupted graphs
      for (let i = 0; i < 512 && cursor; i++) {
        if (cursor === source.id) {
          return NextResponse.json({ error: 'Cannot move a container into its own descendant' }, { status: 400 })
        }
        const parent = await prisma.container.findUnique({
          where: { id: cursor },
          select: { parentId: true },
        })
        cursor = parent?.parentId ?? null
      }
    }

    // Determine resulting locationId:
    // - If moving under another container -> adopt target.locationId
    // - If moving to root -> keep current locationId (caller can change via move-location)
    const resultingLocationId = target ? target.locationId : source.locationId

    await prisma.container.update({
      where: { id: source.id },
      data: {
        parentId: target ? target.id : null,
        locationId: resultingLocationId,
      },
    })

    // NOTE: if you want children to follow to the new location, you’ll need a recursive update.
    // That’s optional and can be added later.

    return NextResponse.json({
      ok: true,
      containerId: source.id,
      newParentId: target ? target.id : null,
      locationId: resultingLocationId,
    })
  } catch (err) {
    console.error('❌ move-parent failed:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
