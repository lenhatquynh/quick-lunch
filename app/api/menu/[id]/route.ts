import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const menu = await prisma.menu.findUnique({
      where: { id },
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

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isLocked, items } = body;

    const existingMenu = await prisma.menu.findUnique({
      where: { id },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    if (existingMenu.isLocked) {
      return NextResponse.json(
        { error: 'Cannot update a locked menu. Create a new menu instead.' },
        { status: 403 }
      );
    }

    const updateData: { isLocked?: boolean; items?: { create: { name: string; notes: string | null; sortOrder: number }[] } } = {};

    if (typeof isLocked === 'boolean') {
      updateData.isLocked = isLocked;
    }

    if (items && Array.isArray(items)) {
      await prisma.menuItem.deleteMany({
        where: { menuId: id },
      });

      updateData.items = {
        create: items.map((item: { name: string; notes?: string }, index: number) => ({
          name: item.name,
          notes: item.notes || null,
          sortOrder: index,
        })),
      };
    }

    const menu = await prisma.menu.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const existingMenu = await prisma.menu.findUnique({
      where: { id },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    if (existingMenu.isLocked) {
      return NextResponse.json(
        { error: 'Cannot delete a locked menu' },
        { status: 403 }
      );
    }

    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json({ error: 'Failed to delete menu' }, { status: 500 });
  }
}
