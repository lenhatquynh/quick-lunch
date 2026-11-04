import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { menuItemId, personName, quantity = 1, note } = body;

    if (!menuItemId || !personName) {
      return NextResponse.json(
        { error: 'Missing required fields: menuItemId and personName' },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        menu: true,
        selections: true,
      },
    });

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    if (menuItem.menu.isLocked) {
      return NextResponse.json(
        { error: 'Cannot add selection to a locked menu' },
        { status: 403 }
      );
    }

    if (menuItem.isArchived) {
      return NextResponse.json(
        { error: 'This item has been removed from the menu' },
        { status: 400 }
      );
    }

    const requestedQty = Math.max(1, Math.floor(Number(quantity) || 1));

    // Enforce max quantity limit (null = unlimited)
    if (menuItem.maxQuantity !== null) {
      const currentCount = menuItem.selections.length;
      if (currentCount >= menuItem.maxQuantity) {
        return NextResponse.json(
          {
            error: `Đã đạt giới hạn số lượng cho món này (tối đa ${menuItem.maxQuantity})`,
          },
          { status: 400 }
        );
      }
      if (currentCount + requestedQty > menuItem.maxQuantity) {
        const remaining = menuItem.maxQuantity - currentCount;
        return NextResponse.json(
          {
            error: `Chỉ còn ${remaining} suất cho món này (tối đa ${menuItem.maxQuantity})`,
          },
          { status: 400 }
        );
      }
    }

    const trimmedNote = note && String(note).trim() ? String(note).trim() : null;

    const selections = await Promise.all(
      Array.from({ length: requestedQty }, () =>
        prisma.selection.create({
          data: {
            menuItemId,
            personName,
            note: trimmedNote,
          },
        })
      )
    );

    const updatedItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        selections: true,
      },
    });

    return NextResponse.json({ selections, menuItem: updatedItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating selection:', error);
    return NextResponse.json({ error: 'Failed to create selection' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const selectionId = searchParams.get('selectionId');
    const menuItemId = searchParams.get('menuItemId');
    const personName = searchParams.get('personName');

    if (selectionId) {
      const selection = await prisma.selection.findUnique({
        where: { id: selectionId },
        include: { menuItem: { include: { menu: true } } },
      });

      if (!selection) {
        return NextResponse.json({ error: 'Selection not found' }, { status: 404 });
      }

      if (selection.menuItem.menu.isLocked) {
        return NextResponse.json(
          { error: 'Cannot delete selection from a locked menu' },
          { status: 403 }
        );
      }

      await prisma.selection.delete({
        where: { id: selectionId },
      });
    } else if (menuItemId) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: menuItemId },
        include: { menu: true },
      });

      if (!menuItem) {
        return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
      }

      if (menuItem.menu.isLocked) {
        return NextResponse.json(
          { error: 'Cannot delete selections from a locked menu' },
          { status: 403 }
        );
      }

      await prisma.selection.deleteMany({
        where: {
          menuItemId,
          ...(personName && personName.trim() ? { personName: personName.trim() } : {}),
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Must provide either selectionId or menuItemId' },
        { status: 400 }
      );
    }

    const updatedItem = menuItemId
      ? await prisma.menuItem.findUnique({
          where: { id: menuItemId },
          include: { selections: true },
        })
      : null;

    return NextResponse.json({ success: true, menuItem: updatedItem });
  } catch (error) {
    console.error('Error deleting selection:', error);
    return NextResponse.json({ error: 'Failed to delete selection' }, { status: 500 });
  }
}
