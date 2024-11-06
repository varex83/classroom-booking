import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const classroomId = searchParams.get('classroomId');

        const bookings = await prisma.booking.findMany({
            where: {
                ...(startDate && endDate ? {
                    date: {
                        gte: startOfDay(new Date(startDate)),
                        lte: endOfDay(new Date(endDate)),
                    }
                } : {}),
                ...(classroomId ? { classroomId: parseInt(classroomId) } : {}),
            },
            include: {
                classroom: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Failed to fetch schedule:', error);
        return NextResponse.json(
            { error: 'Failed to fetch schedule', details: error },
            { status: 500 }
        );
    }
} 