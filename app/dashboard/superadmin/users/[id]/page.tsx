"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userAPI } from '@/lib/api';
import { RoleGuard } from '@/components/role-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await userAPI.get(Number(params.id));
                if (res.data.success) {
                    setUser(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
                toast.error("Failed to load user details");
                router.push('/dashboard/superadmin');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchUser();
        }
    }, [params.id, router]);

    if (loading) return <div className="p-8">Loading...</div>;
    if (!user) return <div className="p-8">User not found</div>;

    return (
        <RoleGuard allowedRoles={['SuperAdmin']}>
            <div className="min-h-screen bg-slate-100 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6 flex items-center justify-between">
                        <Button variant="outline" onClick={() => router.push('/dashboard/superadmin')}>
                            ← Back to Dashboard
                        </Button>
                        <div className="space-x-2">
                            <Button onClick={() => router.push(`/dashboard/superadmin/users/${user.id}/edit`)}>
                                Edit User
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">User Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500">Full Name</h3>
                                    <p className="text-lg font-semibold">{user.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500">Email Address</h3>
                                    <p className="text-lg">{user.email}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-2">Assigned Roles</h3>
                                <div className="flex gap-2">
                                    {user.roles && user.roles.map((role: any) => (
                                        <Badge key={role.id} variant="secondary">
                                            {role.name}
                                        </Badge>
                                    ))}
                                    {(!user.roles || user.roles.length === 0) && <span className="text-slate-400">No roles assigned</span>}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-500 mb-2">Account Status</h3>
                                <div className="flex gap-4">
                                    <div className="bg-slate-50 p-3 rounded border">
                                        <span className="block text-xs text-slate-500">Joined</span>
                                        <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded border">
                                        <span className="block text-xs text-slate-500">Last Verified</span>
                                        <span className="font-medium">
                                            {user.email_verified_at ? new Date(user.email_verified_at).toLocaleDateString() : 'Not Verified'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RoleGuard>
    );
}
