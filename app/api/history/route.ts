import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);

    let cursor: { date: Date; id: string } | undefined;
    const cursorParam = searchParams.get('cursor');
    if (cursorParam) {
      const parts = cursorParam.split('_');
      if (parts.length === 2) {
        cursor = {
          date: new Date(parts[0]),
          id: parts[1],
        };
      }
    }

    const where = cursor
      ? {
          OR: [
            { date: { lt: cursor.date } },
            { date: cursor.date, id: { lt: cursor.id } },
          ],
        }
      : {};

    const menus = await prisma.menu.findMany({
      where,
      include: {
        items: {
          include: {
            selections: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { id: 'desc' },
      ],
      take: limit + 1,
    });

    const hasMore = menus.length > limit;
    const items = hasMore ? menus.slice(0, limit) : menus;
    const lastItem = items[items.length - 1];
    const nextCursor = lastItem
      ? `${lastItem.date.toISOString()}_${lastItem.id}`
      : null;

    const history = items.map((menu) => {
      const allSelections = menu.items.flatMap((item) => item.selections);

      const personMap = new Map<string, { total: number; paid: number }>();
      allSelections.forEach((selection) => {
        const existing = personMap.get(selection.personName);
        if (existing) {
          existing.total += 1;
          if (selection.isPaid) existing.paid += 1;
        } else {
          personMap.set(selection.personName, {
            total: 1,
            paid: selection.isPaid ? 1 : 0,
          });
        }
      });
      const paidPeople = Array.from(personMap.values()).filter((p) => p.paid === p.total).length;

      return {
        id: menu.id,
        date: menu.date.toISOString().split('T')[0],
        creatorName: menu.creatorName,
        isLocked: menu.isLocked,
        totalItems: menu.items.filter((item) => !item.isArchived).length,
        totalSelections: allSelections.length,
        totalPeople: personMap.size,
        paidSelections: paidPeople,
      };
    });

    return NextResponse.json({
      items: history,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
