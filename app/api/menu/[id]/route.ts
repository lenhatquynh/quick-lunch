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

    const updateData: {
      isLocked?: boolean;
      items?: {
        create: {
          name: string;
          notes: string | null;
          maxQuantity: number | null;
          sortOrder: number;
        }[];
      };
    } = {};

    if (typeof isLocked === 'boolean') {
      updateData.isLocked = isLocked;
    }

    if (items && Array.isArray(items)) {
      // Get existing items with their selections to preserve selections
      const existingItems = await prisma.menuItem.findMany({
        where: { menuId: id },
        include: { selections: true },
      });

      // Map existing items by id (preferred) and by name (fallback) for matching
      const existingItemsById = new Map(existingItems.map((item) => [item.id, item]));
      // Ưu tiên món chưa bị gỡ; nếu không có thì dùng món đã gỡ để khôi phục lại
      // (giữ nguyên lựa chọn của người dùng thay vì tạo món mới)
      const existingItemsByName = new Map<string, (typeof existingItems)[number]>();
      for (const item of existingItems) {
        const key = item.name.trim().toLowerCase();
        const current = existingItemsByName.get(key);
        if (!current || (current.isArchived && !item.isArchived)) {
          existingItemsByName.set(key, item);
        }
      }

      // Process new items: update existing ones, create new ones
      const updates: Promise<unknown>[] = [];
      const keptItemIds: string[] = [];

      for (let index = 0; index < items.length; index++) {
        const newItem = items[index];
        const maxQuantity =
          newItem.maxQuantity === null || newItem.maxQuantity === undefined
            ? null
            : Math.max(1, Math.floor(Number(newItem.maxQuantity)));

        // Match by id first, then by name (case-insensitive)
        const existingItem =
          (newItem.id ? existingItemsById.get(newItem.id) : undefined) ??
          existingItemsByName.get(newItem.name.trim().toLowerCase());

        if (existingItem) {
          keptItemIds.push(existingItem.id);
          // Update existing item (keep selections)
          updates.push(
            prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                name: newItem.name.trim(),
                notes: newItem.notes || null,
                maxQuantity,
                sortOrder: index,
                isArchived: false,
              },
            })
          );
        } else {
          // Create new item (no selections yet)
          updates.push(
            prisma.menuItem.create({
              data: {
                menuId: id,
                name: newItem.name.trim(),
                notes: newItem.notes || null,
                maxQuantity,
                sortOrder: index,
              },
            })
          );
        }
      }

      // Archive items that are no longer in the new menu (soft delete, keeps selections)
      const itemsToArchive = existingItems.filter(
        (item) => !item.isArchived && !keptItemIds.includes(item.id)
      );
      if (itemsToArchive.length > 0) {
        updates.push(
          prisma.menuItem.updateMany({
            where: {
              id: { in: itemsToArchive.map((item) => item.id) },
            },
            data: { isArchived: true },
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
