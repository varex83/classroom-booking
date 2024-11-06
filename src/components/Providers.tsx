'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
    session: any; // You can type this more specifically if needed
}

export default function Providers({ children, session }: ProvidersProps) {
    return (
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
    );
} 