import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Find user
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        // Check if user exists and password matches
        if (!user || user.password !== password) { // In production, use proper password comparison
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        return NextResponse.json({
            user: userWithoutPassword,
        }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 400 }
        );
    }
} 