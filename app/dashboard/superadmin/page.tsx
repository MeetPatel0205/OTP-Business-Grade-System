'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

import { RoleGuard } from '@/components/role-guard';
import { UserManagementTable } from '@/components/user-management-table';
import { EditRoleDialog } from '@/components/edit-role-dialog';
import { userAPI } from '@/lib/api';

export default function SuperAdminDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [users, setUsers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editRoleOpen, setEditRoleOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<any>(null);
    const [activeSection, setActiveSection] = React.useState('dashboard');

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        router.push('/login');
    };

    const fetchUsers = React.useCallback(async () => {
        try {
            const res = await userAPI.getAll();
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (activeSection === 'users') {
            fetchUsers();
        }
    }, [activeSection, fetchUsers]);

    // Initial fetch
    React.useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEditRole = (user: any) => {
        setSelectedUser(user);
        setEditRoleOpen(true);
    };

    const handleDeleteUser = async (user: any) => {
        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            try {
                // Assuming userAPI.delete exists or we add it
                // For now, I'll assume we need to add it to api.ts
                // const res = await userAPI.delete(user.id);
                // Toast success and refetch
                toast.info("Delete functionality requires api implementation.");
            } catch (e) {
                toast.error("Failed to delete user");
            }
        }
    };

    const handleViewUser = (user: any) => {
        router.push(`/dashboard/superadmin/users/${user.id}`);
    }

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900">System Overview</h1>
                                <p className="text-slate-500">Full control access granted.</p>
                            </div>
                            <div className="flex gap-4">
                                <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => setActiveSection('users')}>
                                    Manage Users
                                </Button>
                                <Button variant="outline">
                                    System Health
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <Card className="border-t-4 border-t-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-slate-500">TOTAL USERS</CardTitle>
                                    <div className="text-3xl font-bold">{users.length}</div>
                                </CardHeader>
                            </Card>
                            <Card className="border-t-4 border-t-green-500">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-slate-500">ACTIVE SESSIONS</CardTitle>
                                    <div className="text-3xl font-bold">42</div>
                                </CardHeader>
                            </Card>
                            <Card className="border-t-4 border-t-red-500">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-slate-500">CRITICAL ALERTS</CardTitle>
                                    <div className="text-3xl font-bold text-red-600">0</div>
                                </CardHeader>
                            </Card>
                        </div>
                    </>
                );
            case 'users':
                return (
                    <>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900">User Management</h1>
                                <p className="text-slate-500">Manage system users and their roles.</p>
                            </div>
                            <div className="flex gap-4">
                                <Button className="bg-slate-900 text-white hover:bg-slate-800">
                                    + Create New User
                                </Button>
                            </div>
                        </div>

                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>All Users</CardTitle>
                                <CardDescription>A list of all users and their current roles.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UserManagementTable
                                    data={users}
                                    onEditRole={handleEditRole}
                                    onDeleteUser={handleDeleteUser}
                                    onViewUser={handleViewUser}
                                />
                            </CardContent>
                        </Card>
                    </>
                );
            default:
                return <div>Section not implemented</div>;
        }
    };

    return (
        <RoleGuard allowedRoles={['SuperAdmin']}>
            <div className="min-h-screen bg-slate-100">
                <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white p-6">
                    <div className="mb-10 text-xl font-bold tracking-wider text-red-500">
                        SUPER ADMIN
                    </div>

                    <nav className="space-y-4">
                        <div
                            className={`p-3 rounded font-medium cursor-pointer ${activeSection === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setActiveSection('dashboard')}
                        >
                            Dashboard Overview
                        </div>
                        <div
                            className={`p-3 rounded font-medium cursor-pointer ${activeSection === 'users' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setActiveSection('users')}
                        >
                            User Management
                        </div>
                        <div className="text-slate-400 hover:text-white p-3 cursor-pointer">
                            System Settings
                        </div>
                        <div className="text-slate-400 hover:text-white p-3 cursor-pointer">
                            Audit Logs
                        </div>
                    </nav>

                    <div className="absolute bottom-6 left-6 right-6">
                        <Button variant="destructive" className="w-full" onClick={handleLogout}>
                            Sign Out
                        </Button>
                    </div>
                </aside>

                <main className="ml-64 p-8">
                    {renderContent()}
                </main>

                <EditRoleDialog
                    open={editRoleOpen}
                    onOpenChange={setEditRoleOpen}
                    user={selectedUser}
                    onSuccess={fetchUsers}
                />
            </div>
        </RoleGuard>
    );
}
