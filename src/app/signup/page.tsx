"use client";

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const SignUpPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordRequirements, setPasswordRequirements] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
    });

    const validatePassword = (password: string) => {
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>_]/.test(password),
        };
        setPasswordRequirements(requirements);
        return Object.values(requirements).every(Boolean);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validatePassword(password)) {
            setError('Please meet all password requirements');
            return;
        }

        try {
            const response = await axios.post('/api/users', {
                name,
                email,
                password,
                role: 'Staff'
            });

            if (response.status === 201) {
                alert('User created successfully! You can now log in.');
                window.location.href = '/login';
            }
        } catch (error: any) {
            if (error.response) {
                setError(error.response.data.error || 'Failed to create user');
            } else if (error.request) {
                setError('No response from server. Please try again.');
            } else {
                setError('An error occurred. Please try again.');
            }
            console.error('Signup error:', error);
        }
    };

    const getPasswordStrength = () => {
        const requirements = Object.values(passwordRequirements);
        const metCount = requirements.filter(Boolean).length;
        if (metCount === 0) return { text: 'Very Weak', color: 'bg-red-500' };
        if (metCount <= 2) return { text: 'Weak', color: 'bg-orange-500' };
        if (metCount <= 4) return { text: 'Medium', color: 'bg-yellow-500' };
        return { text: 'Strong', color: 'bg-green-500' };
    };

    const strength = getPasswordStrength();

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
            <div className="card w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
                    <p className="text-gray-600 mt-2">Sign up to start booking classrooms</p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                validatePassword(e.target.value);
                            }}
                            required
                            className="input-field"
                        />
                        
                        {/* Password strength indicator */}
                        {password && (
                            <div className="mt-2">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600">Password strength:</span>
                                    <span className="text-sm font-medium">{strength.text}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded">
                                    <div 
                                        className={`h-full rounded transition-all duration-300 ${strength.color}`}
                                        style={{ 
                                            width: `${(Object.values(passwordRequirements).filter(Boolean).length / 5) * 100}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Password requirements checklist */}
                        <ul className="mt-2 text-sm space-y-1">
                            <li className={passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}>
                                ✓ At least 8 characters
                            </li>
                            <li className={passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}>
                                ✓ At least one uppercase letter
                            </li>
                            <li className={passwordRequirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}>
                                ✓ At least one lowercase letter
                            </li>
                            <li className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                                ✓ At least one number
                            </li>
                            <li className={passwordRequirements.hasSpecial ? 'text-green-600' : 'text-gray-500'}>
                                ✓ At least one special character
                            </li>
                        </ul>
                    </div>

                    <button type="submit" className="btn-primary w-full">
                        Sign up
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;