"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface Classroom {
    id: number;
    name: string;
    capacity: number;
}

const ClassroomsPanel = () => {
    const { data: session } = useSession();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
    });

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const response = await axios.get('/api/classrooms');
            setClassrooms(response.data);
            setError('');
        } catch (error) {
            setError('Failed to fetch classrooms');
            console.error('Error fetching classrooms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (editingClassroom) {
                await axios.patch(`/api/classrooms/${editingClassroom.id}`, {
                    ...formData,
                    userId: session?.user?.id, // Pass userId for activity logging
                });
            } else {
                await axios.post('/api/classrooms', formData);
            }
            fetchClassrooms();
            resetForm();
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to save classroom');
        }
    };

    const handleEdit = (classroom: Classroom) => {
        setEditingClassroom(classroom);
        setFormData({
            name: classroom.name,
            capacity: classroom.capacity.toString(),
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this classroom?')) return;

        try {
            await axios.delete(`/api/classrooms/${id}`);
            fetchClassrooms();
        } catch (error) {
            setError('Failed to delete classroom');
        }
    };

    const resetForm = () => {
        setEditingClassroom(null);
        setFormData({
            name: '',
            capacity: '',
        });
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingClassroom ? 'Edit Classroom' : 'Add New Classroom'}
                </h3>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            required
                            placeholder="e.g., Room 101"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity</label>
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            className="input-field"
                            required
                            min="1"
                            placeholder="e.g., 30"
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button type="submit" className="btn-primary">
                            {editingClassroom ? 'Update Classroom' : 'Add Classroom'}
                        </button>
                        {editingClassroom && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Classrooms List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-y border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Capacity
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {classrooms.map((classroom) => (
                                <tr key={classroom.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {classroom.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {classroom.capacity} seats
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(classroom)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(classroom.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
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

export default ClassroomsPanel; 