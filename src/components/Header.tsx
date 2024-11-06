"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Header = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: '/' });
    };

    const handleBooking = () => {
        if (status === 'authenticated') {
            router.push('/booking');
        } else {
            router.push('/login?callbackUrl=/booking');
        }
    };

    // Don't render until we know the authentication state
    if (status === 'loading') {
        return null;
    }

    return (
        <header className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex justify-between items-center h-16">
                    <h1 className="text-xl font-semibold">
                        <Link href="/" className="text-gray-900 hover:text-blue-600 transition-colors">
                            Classroom Booking
                        </Link>
                    </h1>
                    <ul className="flex items-center space-x-8">
                        <li>
                            <button 
                                onClick={handleBooking}
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                Book a Classroom
                            </button>
                        </li>
                        {status === 'authenticated' ? (
                            <>
                                {session.user.role === 'Admin' && (
                                    <li>
                                        <Link 
                                            href="/admin" 
                                            className="text-gray-600 hover:text-blue-600 transition-colors"
                                        >
                                            Admin Panel
                                        </Link>
                                    </li>
                                )}
                                <li className="flex items-center space-x-4">
                                    <Link 
                                        href="/settings" 
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        {session.user.name}
                                    </Link>
                                    <button 
                                        onClick={handleSignOut}
                                        className="btn-secondary"
                                    >
                                        Sign Out
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <Link 
                                    href="/login" 
                                    className="btn-primary"
                                >
                                    Sign In
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header; 