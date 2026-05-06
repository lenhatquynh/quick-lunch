import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get('menuId');
    const personName = searchParams.get('personName');

    if (!menuId || !personName) {
      return NextResponse.json(
        { error: 'Missing required fields: menuId and personName' },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        items: {
          include: {
            selections: {
              where: {
                personName,
                isPaid: true,
              },
            },
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    const allPaidSelections = menu.items.flatMap((item) => item.selections);

    if (allPaidSelections.length === 0) {
      return NextResponse.json(
        { error: 'No paid selections found for this person' },
        { status: 404 }
      );
    }

    await Promise.all(
      allPaidSelections.map((selection) =>
        prisma.selection.update({
          where: { id: selection.id },
          data: {
            isPaid: false,
            paidAt: null,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      cancelledCount: allPaidSelections.length,
      message: `Đã hủy thanh toán cho ${personName}`,
    });
  } catch (error) {
    console.error('Error cancelling all payments:', error);
    return NextResponse.json({ error: 'Failed to cancel payment' }, { status: 500 });
  }
}
