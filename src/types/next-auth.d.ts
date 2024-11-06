import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface User {
        id: string;
        email: string;
        name: string;
        role: string;
    }

    interface Session extends DefaultSession {
        user: User;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: string;
        id?: string;
    }
} 