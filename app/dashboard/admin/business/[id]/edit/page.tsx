'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { businessAPI } from '@/lib/api';
import { RoleGuard } from '@/components/role-guard';

export default function EditBusinessPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [data, setData] = React.useState<any>({ name: '', revenue: 0 });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                if (!params?.id) return;
                const id = Number(params.id);
                const res = await businessAPI.get(id);

                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch business", error);
                toast.error("Failed to load business data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params?.id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!params?.id) return;
            const id = Number(params.id);
            const res = await businessAPI.update(id, data);

            // Strict check for success
            if (res.data.success) {
                toast.success("Business updated successfully");
                // Force a refresh of the server data before navigating
                router.refresh();
                router.push('/dashboard/admin');
            } else {
                toast.error(res.data.message || "Update failed");
            }
        } catch (error: any) {
            console.error("Update failed", error);
            const msg = error.response?.data?.message || "Failed to update business";
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
                        <CardTitle>Edit Business</CardTitle>
                        <CardDescription>Update business details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Business Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="revenue">Revenue</Label>
                                <Input
                                    id="revenue"
                                    type="number"
                                    value={data.revenue}
                                    onChange={(e) => setData({ ...data, revenue: Number(e.target.value) })}
                                    required
                                />
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
