import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { menuId, personName } = body;

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
                isPaid: false,
              },
            },
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    const allUnpaidSelections = menu.items.flatMap((item) => item.selections);

    if (allUnpaidSelections.length === 0) {
      return NextResponse.json(
        { error: 'No unpaid selections found for this person' },
        { status: 404 }
      );
    }

    await Promise.all(
      allUnpaidSelections.map((selection) =>
        prisma.selection.update({
          where: { id: selection.id },
          data: {
            isPaid: true,
            paidAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      paidCount: allUnpaidSelections.length,
      message: `Đã xác nhận thanh toán ${allUnpaidSelections.length} món cho ${personName}`,
    });
  } catch (error) {
    console.error('Error confirming all payments:', error);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}
