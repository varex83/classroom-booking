"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Stats {
    totalUsers: number;
    totalClassrooms: number;
    totalBookings: number;
    todayBookings: number;
}

interface Activity {
    id: number;
    type: 'booking' | 'user' | 'classroom';
    action: string;
    userId: number;
    details: string;
    timestamp: Date;
    user: {
        name: string;
    };
}

interface BookingTrend {
    date: string;
    bookings: number;
}

interface RoomUtilization {
    name: string;
    value: number;
}

const COLORS = ['#0088FE', '#00C49F'];

const DashboardPanel = () => {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalClassrooms: 0,
        totalBookings: 0,
        todayBookings: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [bookingTrend, setBookingTrend] = useState<BookingTrend[]>([]);
    const [roomUtilization, setRoomUtilization] = useState<RoomUtilization[]>([
        { name: 'In Use', value: 0 },
        { name: 'Available', value: 0 },
    ]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());

                const endOfWeek = new Date(today);
                endOfWeek.setDate(startOfWeek.getDate() + 6);

                const [users, classrooms, bookings, activitiesResponse] = await Promise.all([
                    axios.get('/api/users'),
                    axios.get('/api/classrooms'),
                    axios.get('/api/schedule', {
                        params: {
                            startDate: startOfWeek.toISOString(),
                            endDate: endOfWeek.toISOString(),
                        }
                    }),
                    axios.get('/api/activities'),
                ]);

                // Set basic stats
                const todayBookings = bookings.data.filter((booking: any) => 
                    new Date(booking.date).toDateString() === new Date().toDateString()
                ).length;

                setStats({
                    totalUsers: users.data.length,
                    totalClassrooms: classrooms.data.length,
                    totalBookings: bookings.data.length,
                    todayBookings,
                });

                // Set room utilization
                setRoomUtilization([
                    { name: 'In Use', value: todayBookings },
                    { name: 'Available', value: classrooms.data.length - todayBookings },
                ]);

                // Set booking trend
                const trend: BookingTrend[] = Array.from({ length: 7 }, (_, i) => {
                    const date = subDays(new Date(), 6 - i);
                    const dayBookings = bookings.data.filter((booking: any) => 
                        new Date(booking.date).toDateString() === date.toDateString()
                    ).length;
                    return {
                        date: format(date, 'MMM dd'),
                        bookings: dayBookings,
                    };
                });
                setBookingTrend(trend);

                // Set activities
                setActivities(activitiesResponse.data);
                setError(null);
            } catch (error: any) {
                console.error('Failed to fetch data:', error);
                setError(error.response?.data?.error || 'Failed to load dashboard data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
                </div>
                <div className="text-3xl text-gray-400">{icon}</div>
            </div>
        </div>
    );

    const ActivityItem = ({ activity }: { activity: Activity }) => (
        <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`
                mt-1 rounded-full p-2
                ${activity.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'user' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'}
            `}>
                {activity.type === 'booking' ? '📅' :
                 activity.type === 'user' ? '👤' : '🏛️'}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900">{activity.user.name}</p>
                    <p className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                    </p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
            </div>
        </div>
    );

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon="👥" />
                <StatCard title="Total Classrooms" value={stats.totalClassrooms} icon="🏛️" />
                <StatCard title="Total Bookings" value={stats.totalBookings} icon="📚" />
                <StatCard title="Today's Bookings" value={stats.todayBookings} icon="📅" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Trends */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Trends</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={bookingTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line 
                                    type="monotone" 
                                    dataKey="bookings" 
                                    stroke="#0088FE" 
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Room Utilization */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Room Utilization</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roomUtilization}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {roomUtilization.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPanel; 