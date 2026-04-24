import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const menu = await prisma.menu.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
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
          create: items.map((item: { name: string; notes?: string }, index: number) => ({
            name: item.name,
            notes: item.notes || null,
            sortOrder: index,
          })),
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
