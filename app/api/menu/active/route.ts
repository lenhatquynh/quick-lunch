import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      where: {
        isLocked: false,
      },
      include: {
        items: {
          include: {
            selections: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(menus);
  } catch (error) {
    console.error('Error fetching active menus:', error);
    return NextResponse.json({ error: 'Failed to fetch active menus' }, { status: 500 });
  }
}
