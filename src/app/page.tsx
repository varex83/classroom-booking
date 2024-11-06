"use client";

import BackgroundAnimation from '../components/BackgroundAnimation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleBooking = () => {
        if (status === 'authenticated') {
            router.push('/booking');
        } else {
            router.push('/login?callbackUrl=/booking');
        }
    };

    return (
        <>
            <BackgroundAnimation />
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative">
                <div className="max-w-3xl mx-auto text-center px-4">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Simple Classroom Booking
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Efficiently manage and book classrooms for your educational institution
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={handleBooking}
                            className="btn-primary"
                        >
                            Book a Classroom
                        </button>
                        {!session && (
                            <a href="/login" className="btn-secondary">
                                Sign In
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomePage;
