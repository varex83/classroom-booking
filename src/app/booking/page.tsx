"use client";

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Calendar from '@/components/Calendar';
import BookingForm from '@/components/BookingForm';

const BookingPage = () => {
    const { data: session } = useSession();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
    const [editingBooking, setEditingBooking] = useState<any>(null);
    const [key, setKey] = useState(0);

    const handleBookingComplete = useCallback(() => {
        setKey(prev => prev + 1);
        setEditingBooking(null);
    }, []);

    const handleClassroomChange = (classroomId: string) => {
        setSelectedClassroom(classroomId);
        setSelectedDate(null);
        setSelectedSlot(null);
        setEditingBooking(null);
        setKey(prev => prev + 1);
    };

    const handleBookingClick = (booking: any) => {
        setEditingBooking(booking);
        setSelectedDate(new Date(booking.date));
        setSelectedSlot(booking.time);
        setSelectedClassroom(booking.classroom.id.toString());
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Book a Classroom</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar Section */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
                    <Calendar 
                        key={key}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        onSlotSelect={setSelectedSlot}
                        selectedClassroom={selectedClassroom}
                        userId={session?.user?.id}
                        onBookingClick={handleBookingClick}
                    />
                </div>

                {/* Booking Form Section */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingBooking ? 'Edit Booking' : 'Booking Details'}
                    </h2>
                    <BookingForm 
                        selectedDate={selectedDate}
                        selectedSlot={selectedSlot}
                        userId={session?.user?.id}
                        onBookingComplete={handleBookingComplete}
                        onClassroomChange={handleClassroomChange}
                        selectedClassroom={selectedClassroom}
                        editingBooking={editingBooking}
                    />
                </div>
            </div>
        </div>
    );
};

export default BookingPage;