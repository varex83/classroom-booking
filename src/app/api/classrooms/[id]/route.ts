import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const classroomId = parseInt(params.id);
        const body = await request.json();
        const { name, capacity } = body;

        const classroom = await prisma.classroom.update({
            where: {
                id: classroomId,
            },
            data: {
                name,
                capacity: parseInt(capacity),
            },
        });

        // Log activity
        await prisma.activity.create({
            data: {
                type: 'classroom',
                action: 'updated',
                userId: body.userId, // Make sure to pass userId from the client
                details: `Updated classroom ${name}`,
            },
        });

        return NextResponse.json(classroom);
    } catch (error) {
        console.error('Classroom update error:', error);
        return NextResponse.json(
            { error: 'Failed to update classroom' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const classroomId = parseInt(params.id);

        const classroom = await prisma.classroom.delete({
            where: {
                id: classroomId,
            },
        });

        return NextResponse.json(classroom);
    } catch (error) {
        console.error('Classroom deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete classroom' },
            { status: 500 }
        );
    }
} 