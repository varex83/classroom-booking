"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

interface BookingFormProps {
    selectedDate: Date | null;
    selectedSlot: string | null;
    userId: string | undefined;
    onBookingComplete?: () => void;
    onClassroomChange: (classroomId: string) => void;
    selectedClassroom: string | null;
}

const BookingForm = ({ selectedDate, selectedSlot, userId, onBookingComplete, onClassroomChange, selectedClassroom: currentClassroom }: BookingFormProps) => {
    const [classrooms, setClassrooms] = useState([]);
    const [localClassroom, setLocalClassroom] = useState('');
    const [purpose, setPurpose] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchClassrooms();
    }, []);

    useEffect(() => {
        if (currentClassroom) {
            setLocalClassroom(currentClassroom);
        }
    }, [currentClassroom]);

    const fetchClassrooms = async () => {
        try {
            const response = await axios.get('/api/classrooms');
            setClassrooms(response.data);
        } catch (error) {
            console.error('Failed to fetch classrooms:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedSlot || !userId) {
            setError('Please select a date and time slot');
            return;
        }

        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await axios.post('/api/booking', {
                userId,
                classroomId: localClassroom,
                date: selectedDate,
                time: selectedSlot,
                purpose,
            });

            setSuccess('Booking confirmed successfully!');
            setPurpose('');
            setLocalClassroom('');
            
            if (onBookingComplete) {
                onBookingComplete();
            }
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to create booking');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClassroomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newClassroomId = e.target.value;
        setLocalClassroom(newClassroomId);
        onClassroomChange(newClassroomId);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                    {success}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selected Date & Time
                </label>
                <input
                    type="text"
                    value={selectedDate && selectedSlot ? 
                        `${format(selectedDate, 'PP')} at ${selectedSlot}` : 
                        'Please select a date and time slot'}
                    className="input-field"
                    disabled
                />
            </div>

            <div>
                <label htmlFor="classroom" className="block text-sm font-medium text-gray-700 mb-1">
                    Classroom
                </label>
                <select
                    id="classroom"
                    value={localClassroom}
                    onChange={handleClassroomChange}
                    required
                    className="input-field"
                    disabled={isLoading}
                >
                    <option value="">Select a classroom</option>
                    {classrooms.map((classroom: any) => (
                        <option key={classroom.id} value={classroom.id}>
                            {classroom.name} (Capacity: {classroom.capacity})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose
                </label>
                <textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                    className="input-field min-h-[100px]"
                    disabled={isLoading}
                    placeholder="Please describe the purpose of your booking"
                />
            </div>

            <button
                type="submit"
                className="btn-primary w-full"
                disabled={isLoading || !selectedDate || !selectedSlot}
            >
                {isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
        </form>
    );
};

export default BookingForm;