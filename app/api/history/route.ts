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

    const history = menus.map((menu) => {
      const allSelections = menu.items.flatMap((item) => item.selections);
      
      // Đếm số người đã thanh toán hết
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
        totalItems: menu.items.length,
        totalSelections: allSelections.length,
        totalPeople: personMap.size,
        paidSelections: paidPeople,
      };
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
