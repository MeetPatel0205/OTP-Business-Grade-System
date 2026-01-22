'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { userAPI, roleAPI } from '@/lib/api';
import { RoleGuard } from '@/components/role-guard';
import { Checkbox } from "@/components/ui/checkbox"

export default function EditUserPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [userData, setUserData] = React.useState<any>({ name: '', email: '' });
    const [roles, setRoles] = React.useState<any[]>([]);
    const [selectedRole, setSelectedRole] = React.useState<string>('');

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                if (!params?.id) return;
                const userId = Number(params.id);

                // Strict Role Fetching
                // If user is Admin (and not SuperAdmin), they CANNOT change roles.
                // So we do NOT fetch assignable roles for them anymore.
                const currentUserIsSuperAdmin = user?.roles?.some((r: any) => r.name === 'SuperAdmin');

                let rolesData = [];
                if (currentUserIsSuperAdmin) {
                    const rolesRes = await roleAPI.getAssignable(); // Or getAll() if SuperAdmin gets all
                    rolesData = rolesRes.data.data || rolesRes.data;
                }

                if (userRes.data.success) {
                    setUserData(userRes.data.data);
                    const userRole = userRes.data.data.roles?.[0]?.name;
                    if (userRole) setSelectedRole(userRole);
                }

                setRoles(Array.isArray(rolesData) ? rolesData : []);

            } catch (error: any) {
                console.error("Failed to fetch data", error);
                // Only show toast if it's a critical failure, or be specific
                if (error.response?.status === 403) {
                    toast.error("Permission error loading data");
                } else {
                    toast.error("Failed to load user data");
                }
                // Don't redirect blindly, let them see the error state or partial data
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params?.id, user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!params?.id) {
                toast.error("Invalid user ID");
                setSaving(false);
                return;
            }
            const userId = Number(params.id);
            // Update details
            await userAPI.update(userId, {
                name: userData.name,
                email: userData.email
            });

            // Update role if changed
            if (selectedRole) {
                await userAPI.updateRole(userId, selectedRole);
            }

            toast.success("User updated successfully");
            router.push('/dashboard/admin');
        } catch (error: any) {
            console.error("Update failed", error);
            const msg = error.response?.data?.message || "Failed to update user";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <RoleGuard allowedRoles={['Admin']}>
            <div className="min-h-screen bg-slate-50 p-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Edit User</CardTitle>
                        <CardDescription>Update user details and permissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={userData.name}
                                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Role Assignment</Label>
                                <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-slate-50">
                                    {roles
                                        .filter(role => {
                                            // Security: Only SuperAdmin can see/assign SuperAdmin role
                                            const currentUserIsSuperAdmin = user?.roles?.some((r: any) => r.name === 'SuperAdmin');
                                            if (role.name === 'SuperAdmin' && !currentUserIsSuperAdmin) return false;

                                            // Strict: Admin can strictly only assign 'User' role
                                            const currentUserIsAdmin = user?.roles?.some((r: any) => r.name === 'Admin');
                                            if (currentUserIsAdmin && !currentUserIsSuperAdmin && role.name !== 'User') return false;

                                            return true;
                                        })
                                        .map((role) => (
                                            <div key={role.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${role.id}`}
                                                    checked={selectedRole === role.name}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setSelectedRole(role.name);
                                                    }}
                                                // Disable if it's the current role to prevent accidental deselection if logic requires
                                                />
                                                <Label htmlFor={`role-${role.id}`} className="cursor-pointer">{role.name}</Label>
                                            </div>
                                        ))}
                                </div>
                                <p className="text-xs text-slate-500">
                                    {user?.roles?.some((r: any) => r.name === 'SuperAdmin')
                                        ? 'SuperAdmin Access: Full Control'
                                        : 'Admin Access: Can only assign User role'}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </RoleGuard>
    );
}
