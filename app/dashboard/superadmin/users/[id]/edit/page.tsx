"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userAPI } from '@/lib/api';
import { RoleGuard } from '@/components/role-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await userAPI.get(Number(params.id));
                if (res.data.success) {
                    setFormData({
                        name: res.data.data.name,
                        email: res.data.data.email
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
                toast.error("Failed to load user");
                router.push('/dashboard/superadmin');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchUser();
        }
    }, [params.id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await userAPI.update(Number(params.id), formData);
            if (res.data.success) {
                toast.success('User updated successfully');
                router.push(`/dashboard/superadmin/users/${params.id}`);
            }
        } catch (error: any) {
            console.error("Failed to update user", error);
            // Handle validation errors if any
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to update user");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <RoleGuard allowedRoles={['SuperAdmin']}>
            <div className="min-h-screen bg-slate-100 p-8">
                <div className="max-w-xl mx-auto">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => router.back()}>
                            ← Back
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Edit User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RoleGuard>
    );
}
