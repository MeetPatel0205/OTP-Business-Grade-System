'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { RoleGuard } from '@/components/role-guard';
import { businessAPI } from '@/lib/api';

export default function UserDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [businesses, setBusinesses] = React.useState<any[]>([]);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        router.push('/login');
    };

    React.useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const res = await businessAPI.getAll();
                if (res.data.success) {
                    setBusinesses(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch businesses", error);
            }
        };
        fetchBusinesses();
    }, []);

    return (
        <RoleGuard allowedRoles={['User']}>
            <div className="min-h-screen bg-slate-50">
                <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-bold">
                            USER
                        </div>
                        <span className="font-medium text-slate-800">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">{user?.email}</span>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </nav>

                <main className="max-w-6xl mx-auto p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
                        <p className="text-slate-500">Here is your project overview.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Businesses</CardTitle>
                                <CardDescription>Businesses you have access to</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {businesses.length === 0 && <p className="text-sm text-muted-foreground">No businesses found.</p>}
                                    {businesses.map((business) => (
                                        <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                            <div>
                                                <p className="font-semibold">{business.name}</p>
                                                <p className="text-sm text-slate-500">Active - Revenue: ${business.revenue}</p>
                                            </div>
                                            <Button size="sm" variant="ghost">View Details</Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-600">Role</span>
                                        <span className="font-medium">
                                            {user?.roles?.map(r => r.name).join(', ') || 'User'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-600">Permissions</span>
                                        <span className="font-medium text-xs text-right max-w-[200px]">
                                            {user?.permissions?.map(p => p.name).slice(0, 3).join(', ')}
                                            {(user?.permissions?.length || 0) > 3 && '...'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-600">Joined</span>
                                        <span className="font-medium">{new Date(user?.email_verified_at || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
