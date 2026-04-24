import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        items: {
          include: {
            selections: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const history = menus.map((menu) => ({
      id: menu.id,
      date: menu.date.toISOString().split('T')[0],
      creatorName: menu.creatorName,
      isLocked: menu.isLocked,
      totalItems: menu.items.length,
      totalSelections: menu.items.reduce((acc, item) => acc + item.selections.length, 0),
    }));

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
