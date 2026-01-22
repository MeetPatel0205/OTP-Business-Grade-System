'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { RoleGuard } from '@/components/role-guard';
import { businessAPI, userAPI } from '@/lib/api';

export default function AdminDashboard() {
    console.log("Admin Dashboard Rendered");
    const { user, logout } = useAuth();
    const router = useRouter();
    const [businesses, setBusinesses] = React.useState<any[]>([]);
    const [users, setUsers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        router.push('/login');
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [businessRes, userRes] = await Promise.all([
                    businessAPI.getAll(),
                    userAPI.getAll()
                ]);

                if (businessRes.data.success) {
                    setBusinesses(businessRes.data.data);
                }
                if (userRes.data.success) {
                    setUsers(userRes.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                // toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <RoleGuard allowedRoles={['Admin']}>
            <div className="min-h-screen bg-slate-50">
                <nav className="bg-indigo-950 px-6 py-4 flex justify-between items-center text-white">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-600 border border-indigo-400 px-3 py-1 rounded text-sm font-bold tracking-wider">
                            ADMIN
                        </div>
                        <span className="font-medium text-lg">Management Console</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-indigo-200">{user?.email}</span>
                        <Button variant="secondary" size="sm" onClick={handleLogout} className="bg-indigo-800 text-indigo-100 hover:bg-indigo-700 border-none">
                            Logout
                        </Button>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto p-6">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
                            <p className="text-slate-500">Manage business data and view user activity.</p>
                        </div>
                    </div>

                    <Tabs defaultValue="business">
                        <TabsList className="mb-6">
                            <TabsTrigger value="business">Business Records</TabsTrigger>
                            <TabsTrigger value="users">User Directory</TabsTrigger>
                        </TabsList>

                        <TabsContent value="business">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Management</CardTitle>
                                    <CardDescription>You have permission to READ and UPDATE.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <div className="p-4 bg-slate-100 font-medium grid grid-cols-4">
                                            <span>Business Name</span>
                                            <span>Status</span>
                                            <span>Revenue</span>
                                            <span>Actions</span>
                                        </div>
                                        {businesses.length === 0 && <div className="p-4 text-center text-slate-500">No businesses found.</div>}
                                        {businesses.map((business) => (
                                            <div key={business.id} className="p-4 border-t grid grid-cols-4 items-center">
                                                <span className="font-medium">{business.name}</span>
                                                <span>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                                                </span>
                                                <span>${business.revenue?.toLocaleString() || '0'}</span>
                                                <div className="flex gap-2">
                                                    <Link href={`/dashboard/admin/business/${business.id}/edit`}>
                                                        <Button size="sm" variant="outline">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/dashboard/admin/business/${business.id}/audit`}>
                                                        <Button size="sm" variant="ghost">
                                                            Audit
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="users">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Directory</CardTitle>
                                    <CardDescription>Read-only access to user list.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <div className="p-4 bg-slate-100 font-medium grid grid-cols-4">
                                            <span>User</span>
                                            <span>Role</span>
                                            <span>Join Date</span>
                                            <span>Actions</span>
                                        </div>
                                        {users.length === 0 && <div className="p-4 text-center text-slate-500">No users found.</div>}
                                        {users
                                            .filter(u => {
                                                // Security: Hide SuperAdmin from non-SuperAdmin users
                                                const isSuperAdmin = u.roles?.some((r: any) => r.name === 'SuperAdmin');
                                                const currentUserIsSuperAdmin = user?.roles?.some((r: any) => r.name === 'SuperAdmin');
                                                if (isSuperAdmin && !currentUserIsSuperAdmin) return false;
                                                return true;
                                            })
                                            .map((u) => (
                                                <div key={u.id} className="p-4 border-t grid grid-cols-4 items-center">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                                                            {u.name?.[0]}
                                                        </div>
                                                        <span>{u.name} ({u.email})</span>
                                                    </div>
                                                    <span>
                                                        {u.roles?.map((r: any) => r.name).join(', ') || 'User'}
                                                    </span>
                                                    <span>{new Date(u.created_at || Date.now()).toLocaleDateString()}</span>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => router.push(`/dashboard/admin/users/${u.id}/edit`)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => router.push(`/dashboard/admin/users/${u.id}/audit`)}
                                                        >
                                                            Audit
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </RoleGuard>
    );
}
