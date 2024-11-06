"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfToday, addDays, isSameDay, isAfter, isBefore, parse } from 'date-fns';

interface CalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    onSlotSelect: (slot: string) => void;
    selectedClassroom: string | null;
    userId?: string;
    onBookingClick?: (booking: Booking) => void;
}

interface Booking {
    id: number;
    date: string;
    time: string;
    classroom: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
}

const timeSlots = [
    "9:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00"
];

const Calendar = ({ 
    selectedDate, 
    onDateSelect, 
    onSlotSelect, 
    selectedClassroom,
    userId,
    onBookingClick 
}: CalendarProps) => {
    const [currentWeek, setCurrentWeek] = useState(startOfToday());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!selectedClassroom) {
                setBookings([]);
                return;
            }

            try {
                const response = await axios.get('/api/schedule', {
                    params: {
                        startDate: currentWeek.toISOString(),
                        endDate: addDays(currentWeek, 6).toISOString(),
                        classroomId: selectedClassroom,
                    },
                });
                setBookings(response.data);
                setError(null);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
                setError('Failed to load bookings. Please try again later.');
            }
        };

        fetchBookings();
    }, [currentWeek, selectedClassroom]);

    if (!selectedClassroom) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">
                        Please select a classroom to view available time slots
                    </p>
                </div>
            </div>
        );
    }

    const isSlotBooked = (date: Date, slot: string) => {
        return bookings.some(booking => 
            isSameDay(new Date(booking.date), date) && booking.time === slot
        );
    };

    const isPastSlot = (date: Date, slot: string) => {
        const now = new Date();
        const slotTime = parse(slot, 'HH:mm', date);
        return isBefore(slotTime, now);
    };

    const isUserBooking = (booking: Booking) => {
        return booking.user.id === parseInt(userId!);
    };

    const handleCellClick = (date: Date, slot: string) => {
        const booking = bookings.find(b => 
            isSameDay(new Date(b.date), date) && b.time === slot
        );

        if (booking) {
            if (isUserBooking(booking) && onBookingClick) {
                onBookingClick(booking);
            }
            return;
        }

        if (!isSlotBooked(date, slot) && !isPastSlot(date, slot)) {
            onDateSelect(date);
            onSlotSelect(slot);
            setSelectedSlot(slot);
        }
    };

    return (
        <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
            {error && (
                <div className="m-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                    {error}
                </div>
            )}
            
            <div className="grid grid-cols-8 divide-x divide-gray-100">
                {/* Time slots column */}
                <div className="col-span-1 bg-gray-50/50">
                    <div className="h-14"></div>
                    {timeSlots.map(slot => (
                        <div 
                            key={slot} 
                            className="h-10 flex items-center justify-center p-1 pt-1 text-sm text-gray-500 mx-1 my-0.5 rounded-lg
                                            transition-all duration-200 ease-in-out"
                        >{slot}</div>
                    ))}
                </div>

                {/* Days columns */}
                {Array.from({ length: 7 }).map((_, index) => {
                    const date = addDays(currentWeek, index);
                    return (
                        <div key={index} className="col-span-1">
                            <div className="h-14 flex items-center justify-center font-medium bg-gray-50/50 border-b border-gray-100">
                                <div className="text-center">
                                    <div className="text-gray-600">{format(date, 'EEE')}</div>
                                    <div className="text-gray-900">{format(date, 'd')}</div>
                                </div>
                            </div>
                            {timeSlots.map(slot => {
                                const booking = bookings.find(b => 
                                    isSameDay(new Date(b.date), date) && b.time === slot
                                );
                                const isBooked = Boolean(booking);
                                const isPast = isPastSlot(date, slot);
                                const isSelected = selectedDate && 
                                    isSameDay(selectedDate, date) && 
                                    selectedSlot === slot;
                                const isEditable = booking && isUserBooking(booking);

                                return (
                                    <div
                                        key={`${date}-${slot}`}
                                        onClick={() => handleCellClick(date, slot)}
                                        className={`
                                            h-10 mx-1 my-0.5 rounded-lg
                                            flex items-center justify-center
                                            transition-all duration-200 ease-in-out
                                            ${isPast 
                                                ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                                                : isBooked 
                                                    ? isEditable
                                                        ? 'bg-blue-100 cursor-pointer hover:bg-blue-200'
                                                        : 'bg-gray-100/75 cursor-not-allowed' 
                                                    : isSelected 
                                                        ? 'bg-blue-500 text-white shadow-sm' 
                                                        : 'hover:bg-blue-50 cursor-pointer'}
                                            relative group
                                        `}
                                    >
                                        {isBooked && (
                                            <>
                                                <span className="text-gray-600 text-xs">
                                                    {isEditable ? 'Your Booking' : 'Booked'}
                                                </span>
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                                            hidden group-hover:block z-10">
                                                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                                        {booking.user.name}<br/>
                                                        {booking.classroom.name}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {isPast && !isBooked && (
                                            <span className="text-gray-400 text-sm">Past</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                <div className="flex justify-between">
                    <button
                        onClick={() => setCurrentWeek(date => addDays(date, -7))}
                        disabled={isBefore(addDays(currentWeek, -7), startOfToday())}
                        className={`
                            px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg
                            border border-gray-200 transition-all duration-200 ease-in-out
                            ${isBefore(addDays(currentWeek, -7), startOfToday())
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-gray-50 hover:border-gray-300'}
                        `}
                    >
                        ← Previous Week
                    </button>
                    <button
                        onClick={() => setCurrentWeek(date => addDays(date, 7))}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg
                                 border border-gray-200 hover:bg-gray-50 hover:border-gray-300
                                 transition-all duration-200 ease-in-out"
                    >
                        Next Week →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Calendar;