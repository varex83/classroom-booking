"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

interface Booking {
    id: number;
    date: string;
    time: string;
    userId: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    classroom: {
        id: number;
        name: string;
        capacity: number;
    };
}

const BookingsPanel = () => {
    const { data: session } = useSession();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [classrooms, setClassrooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past', 'my'

    useEffect(() => {
        fetchBookings();
        fetchClassrooms();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get('/api/schedule');
            setBookings(response.data);
            setError('');
        } catch (error) {
            setError('Failed to fetch bookings');
            console.error('Error fetching bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClassrooms = async () => {
        try {
            const response = await axios.get('/api/classrooms');
            setClassrooms(response.data);
        } catch (error) {
            console.error('Failed to fetch classrooms:', error);
        }
    };

    const handleEdit = async (booking: Booking) => {
        if (!session?.user?.role === 'Admin' && booking.userId !== parseInt(session?.user?.id!)) {
            setError('You can only edit your own bookings');
            return;
        }
        setEditingBooking(booking);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBooking) return;

        try {
            await axios.patch(`/api/booking/${editingBooking.id}`, {
                ...editingBooking,
                userId: session?.user?.role === 'Admin' ? editingBooking.userId : session?.user?.id,
            });
            fetchBookings();
            setEditingBooking(null);
            setError('');
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to update booking');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            if (session?.user?.role === 'Admin') {
                await axios.delete(`/api/booking/${id}`);
            } else {
                await axios.delete(`/api/booking/${id}?userId=${session?.user?.id}`);
            }
            fetchBookings();
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to cancel booking');
        }
    };

    const filteredBookings = () => {
        const now = new Date();
        switch (filter) {
            case 'upcoming':
                return bookings.filter(booking => new Date(booking.date) > now);
            case 'past':
                return bookings.filter(booking => new Date(booking.date) < now);
            case 'my':
                return bookings.filter(booking => booking.userId === parseInt(session?.user?.id!));
            default:
                return bookings;
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 p-6">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Bookings List</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            filter === 'all' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            filter === 'upcoming' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            filter === 'past' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Past
                    </button>
                    <button
                        onClick={() => setFilter('my')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            filter === 'my' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        My Bookings
                    </button>
                </div>
            </div>

            {editingBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">Edit Booking</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Classroom</label>
                                <select
                                    value={editingBooking.classroom.id}
                                    onChange={(e) => setEditingBooking({
                                        ...editingBooking,
                                        classroom: { ...editingBooking.classroom, id: parseInt(e.target.value) }
                                    })}
                                    className="input-field"
                                >
                                    {classrooms.map((classroom: any) => (
                                        <option key={classroom.id} value={classroom.id}>
                                            {classroom.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    value={format(new Date(editingBooking.date), 'yyyy-MM-dd')}
                                    onChange={(e) => setEditingBooking({
                                        ...editingBooking,
                                        date: e.target.value
                                    })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Time</label>
                                <select
                                    value={editingBooking.time}
                                    onChange={(e) => setEditingBooking({
                                        ...editingBooking,
                                        time: e.target.value
                                    })}
                                    className="input-field"
                                >
                                    {["09:00", "10:00", "11:00", "12:00", "13:00", 
                                      "14:00", "15:00", "16:00", "17:00"].map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingBooking(null)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-y border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Classroom
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings().map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {format(new Date(booking.date), 'PP')} at {booking.time}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {booking.classroom.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {booking.user.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {(session?.user?.role === 'Admin' || booking.userId === parseInt(session?.user?.id!)) && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(booking)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(booking.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BookingsPanel; 