import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const classrooms = await prisma.classroom.findMany({
            include: {
                bookings: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        
        return NextResponse.json(classrooms);
    } catch (error) {
        console.error('Failed to fetch classrooms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch classrooms' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, capacity } = body;

        const classroom = await prisma.classroom.create({
            data: {
                name,
                capacity: parseInt(capacity),
            },
        });

        return NextResponse.json(classroom, { status: 201 });
    } catch (error) {
        console.error('Failed to create classroom:', error);
        return NextResponse.json(
            { error: 'Failed to create classroom' },
            { status: 500 }
        );
    }
} 