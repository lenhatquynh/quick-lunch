import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { menuItemId, personName } = body;

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

    const selection = await prisma.selection.create({
      data: {
        menuItemId,
        personName,
      },
    });

    const updatedItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        selections: true,
      },
    });

    return NextResponse.json({ selection, menuItem: updatedItem }, { status: 201 });
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
        where: { menuItemId },
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
