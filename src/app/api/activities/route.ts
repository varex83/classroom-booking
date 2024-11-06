import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const activities = await prisma.activity.findMany({
            take: 10, // Get last 10 activities
            orderBy: {
                timestamp: 'desc',
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(activities);
    } catch (error) {
        console.error('Failed to fetch activities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activities' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, action, userId, details } = body;

        const activity = await prisma.activity.create({
            data: {
                type,
                action,
                userId,
                details,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(activity, { status: 201 });
    } catch (error) {
        console.error('Failed to create activity:', error);
        return NextResponse.json(
            { error: 'Failed to create activity' },
            { status: 500 }
        );
    }
} 