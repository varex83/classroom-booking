import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Staff');
    const [departmentId, setDepartmentId] = useState('');
    const [editingUserId, setEditingUserId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await axios.get('/api/users');
            setUsers(response.data);
        };

        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const userData = { name, email, role, departmentId };

        try {
            if (editingUserId) {
                await axios.put(`/api/users/${editingUserId}`, userData);
            } else {
                await axios.post('/api/users', userData);
            }

            // Refresh user list
            const response = await axios.get('/api/users');
            setUsers(response.data);
            resetForm();
        } catch (error) {
            setError('Failed to save user. Please try again.');
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setRole('Staff');
        setDepartmentId('');
        setEditingUserId(null);
    };

    const handleEdit = (user) => {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setDepartmentId(user.departmentId);
        setEditingUserId(user.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/users/${id}`);
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (error) {
            setError('Failed to delete user. Please try again.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl mb-4">User Management</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border p-2"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border p-2"
                />
                <select value={role} onChange={(e) => setRole(e.target.value)} required className="border p-2">
                    <option value="Admin">Admin</option>
                    <option value="Department Head">Department Head</option>
                    <option value="Staff">Staff</option>
                </select>
                <input
                    type="text"
                    placeholder="Department ID"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    required
                    className="border p-2"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    {editingUserId ? 'Update User' : 'Create User'}
                </button>
            </form>

            <ul className="mt-4">
                {users.map((user) => (
                    <li key={user.id} className="flex justify-between items-center border-b py-2">
                        <span>{user.name} - {user.email} - {user.role}</span>
                        <div>
                            <button onClick={() => handleEdit(user)} className="text-blue-500">Edit</button>
                            <button onClick={() => handleDelete(user.id)} className="text-red-500 ml-2">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserManagement; 