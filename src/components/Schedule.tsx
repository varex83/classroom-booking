import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Schedule = () => {
    const [bookings, setBookings] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        const fetchBookings = async () => {
            const response = await axios.get('/api/schedule', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
            });
            setBookings(response.data);
        };

        fetchBookings();
    }, [startDate, endDate]);

    return (
        <div>
            <h2 className="text-2xl mb-4">Schedule Overview</h2>
            <div className="grid grid-cols-7 gap-4">
                {/* Render calendar headers */}
                {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className="font-bold text-center">{/* Day of the week */}</div>
                ))}
                {/* Render bookings */}
                {bookings.map((booking) => (
                    <div key={booking.id} className="border p-2">
                        <p>{booking.classroom.name}</p>
                        <p>{booking.date} at {booking.time}</p>
                        <p>{booking.user.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Schedule; 