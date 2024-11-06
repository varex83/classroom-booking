import './globals.css'; // Import global styles
import Header from '../components/Header';
import Providers from '../components/Providers';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

export const metadata = {
    title: 'Classroom Booking',
    description: 'Manage classroom bookings efficiently',
};

async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="en">
            <body>
                <Providers session={session}>
                    <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="container mx-auto p-4 flex-grow">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}

export default RootLayout;
