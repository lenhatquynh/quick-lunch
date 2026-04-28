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
      // Get existing items with their selections to preserve selections
      const existingItems = await prisma.menuItem.findMany({
        where: { menuId: id },
        include: { selections: true },
      });

      // Map existing items by name for matching
      const existingItemsByName = new Map(
        existingItems.map((item) => [item.name.toLowerCase(), item])
      );

      // Process new items: update existing ones, create new ones
      const updates: Promise<unknown>[] = [];
      const newItemNames: string[] = [];

      for (let index = 0; index < items.length; index++) {
        const newItem = items[index];
        newItemNames.push(newItem.name.toLowerCase());

        const existingItem = existingItemsByName.get(newItem.name.toLowerCase());

        if (existingItem) {
          // Update existing item (keep selections via cascade)
          updates.push(
            prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                name: newItem.name,
                notes: newItem.notes || null,
                sortOrder: index,
              },
            })
          );
        } else {
          // Create new item (no selections yet)
          updates.push(
            prisma.menuItem.create({
              data: {
                menuId: id,
                name: newItem.name,
                notes: newItem.notes || null,
                sortOrder: index,
              },
            })
          );
        }
      }

      // Delete items that are no longer in the new menu (cascades their selections)
      const itemsToDelete = existingItems.filter(
        (item) => !newItemNames.includes(item.name.toLowerCase())
      );
      if (itemsToDelete.length > 0) {
        updates.push(
          prisma.menuItem.deleteMany({
            where: {
              id: { in: itemsToDelete.map((item) => item.id) },
            },
          })
        );
      }

      await Promise.all(updates);
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
