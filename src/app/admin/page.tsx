"use client";

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPanel from '@/components/admin/DashboardPanel';
import UsersPanel from '@/components/admin/UsersPanel';
import ClassroomsPanel from '@/components/admin/ClassroomsPanel';
import BookingsPanel from '@/components/admin/BookingsPanel';

type TabType = 'dashboard' | 'users' | 'classrooms' | 'bookings';

const AdminPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    // Redirect if not admin
    if (session?.user?.role !== 'Admin') {
        router.push('/');
        return null;
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'classrooms', label: 'Classrooms', icon: '🏛️' },
        { id: 'bookings', label: 'Bookings', icon: '📅' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardPanel />;
            case 'users':
                return <UsersPanel />;
            case 'classrooms':
                return <ClassroomsPanel />;
            case 'bookings':
                return <BookingsPanel />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`
                                        py-4 px-1 border-b-2 font-medium text-sm
                                        flex items-center space-x-2
                                        ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                        transition-colors duration-200
                                    `}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white shadow rounded-lg">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage; 