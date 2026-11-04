import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    const menu = await prisma.menu.findFirst({
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

    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error fetching today menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, creatorName, items } = body;

    if (!date || !creatorName || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: date, creatorName, and at least one item' },
        { status: 400 }
      );
    }

    const menuDate = new Date(date);
    menuDate.setHours(0, 0, 0, 0);

    const menu = await prisma.menu.create({
      data: {
        date: menuDate,
        creatorName,
        items: {
          create: items.map(
            (item: { name: string; notes?: string; maxQuantity?: number | null }, index: number) => ({
              name: item.name.trim(),
              notes: item.notes || null,
              maxQuantity:
                item.maxQuantity === null || item.maxQuantity === undefined
                  ? null
                  : Math.max(1, Math.floor(Number(item.maxQuantity))),
              sortOrder: index,
            })
          ),
        },
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
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    console.error('Error creating menu:', error);
    return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 });
  }
}
