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
        selections: {
          where: {
            personName,
            isPaid: false,
          },
        },
      },
    });

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    if (menuItem.selections.length === 0) {
      return NextResponse.json(
        { error: 'No unpaid selections found for this person' },
        { status: 404 }
      );
    }

    const updatedSelections = await Promise.all(
      menuItem.selections.map((selection) =>
        prisma.selection.update({
          where: { id: selection.id },
          data: {
            isPaid: true,
            paidAt: new Date(),
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

    return NextResponse.json({
      selections: updatedSelections,
      menuItem: updatedItem,
      message: `Đã xác nhận thanh toán cho ${personName}`,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get('menuItemId');
    const personName = searchParams.get('personName');

    if (!menuItemId || !personName) {
      return NextResponse.json(
        { error: 'Missing required fields: menuItemId and personName' },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        selections: {
          where: {
            personName,
            isPaid: true,
          },
        },
      },
    });

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    if (menuItem.selections.length === 0) {
      return NextResponse.json(
        { error: 'No paid selections found for this person' },
        { status: 404 }
      );
    }

    await Promise.all(
      menuItem.selections.map((selection) =>
        prisma.selection.update({
          where: { id: selection.id },
          data: {
            isPaid: false,
            paidAt: null,
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

    return NextResponse.json({
      success: true,
      menuItem: updatedItem,
      message: `Đã hủy thanh toán cho ${personName}`,
    });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return NextResponse.json({ error: 'Failed to cancel payment' }, { status: 500 });
  }
}
