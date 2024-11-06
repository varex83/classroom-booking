import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, classroomId, date, time } = body;

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                userId: parseInt(userId),
                classroomId: parseInt(classroomId),
                date: new Date(date),
                time: time,
            },
            include: {
                user: true,
                classroom: true,
            },
        });

        // Log activity
        await prisma.activity.create({
            data: {
                type: 'booking',
                action: 'created',
                userId: parseInt(userId),
                details: `Booked ${booking.classroom.name} for ${format(new Date(date), 'PP')} at ${time}`,
            },
        });

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error('Booking creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create booking' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const bookingId = parseInt(params.id);

        await prisma.booking.delete({
            where: {
                id: bookingId,
            },
        });

        return NextResponse.json(
            { message: 'Booking cancelled successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Booking deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel booking' },
            { status: 500 }
        );
    }
} 