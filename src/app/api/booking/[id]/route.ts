import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { getServerSession } from 'next-auth/next';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const bookingId = parseInt(params.id);
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                classroom: true,
            },
        });

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(booking);
    } catch (error) {
        console.error('Booking fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch booking' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const bookingId = parseInt(params.id);
        const body = await request.json();
        const { classroomId, date, time, userId } = body;

        // Check if the booking exists
        const existingBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { classroom: true, user: true }
        });

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Get user from the session
        const session = await getServerSession();
        
        // Check authorization - allow if admin or booking owner
        if (session?.user?.role !== 'Admin' && existingBooking.userId !== parseInt(userId)) {
            return NextResponse.json(
                { error: 'Not authorized to edit this booking' },
                { status: 403 }
            );
        }

        // Check for booking conflicts
        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                id: { not: bookingId },
                classroomId: parseInt(classroomId),
                date: new Date(date),
                time: time,
            },
        });

        if (conflictingBooking) {
            return NextResponse.json(
                { error: 'Time slot already booked' },
                { status: 400 }
            );
        }

        // Update booking
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
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
                action: 'updated',
                userId: parseInt(session?.user?.role === 'Admin' ? existingBooking.userId.toString() : userId),
                details: `${session?.user?.role === 'Admin' ? '(Admin) ' : ''}Updated booking for ${updatedBooking.classroom.name} to ${format(new Date(date), 'PP')} at ${time}`,
            },
        });

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error('Booking update error:', error);
        return NextResponse.json(
            { error: 'Failed to update booking' },
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
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Get the booking before deletion for activity logging
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { classroom: true }
        });

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Get user from the session
        const session = await getServerSession();

        // Check authorization - allow if admin or booking owner
        if (session?.user?.role !== 'Admin' && booking.userId !== parseInt(userId!)) {
            return NextResponse.json(
                { error: 'Not authorized to delete this booking' },
                { status: 403 }
            );
        }

        // Delete booking
        await prisma.booking.delete({
            where: { id: bookingId },
        });

        // Log activity
        await prisma.activity.create({
            data: {
                type: 'booking',
                action: 'deleted',
                userId: parseInt(session?.user?.role === 'Admin' ? booking.userId.toString() : userId!),
                details: `${session?.user?.role === 'Admin' ? '(Admin) ' : ''}Cancelled booking for ${booking.classroom.name}`,
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