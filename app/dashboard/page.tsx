'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Dashboard</h1>
                    <Button onClick={handleLogout} variant="outline">
                        Logout
                    </Button>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome, {user.name}!</CardTitle>
                            <CardDescription>Your account is verified and active</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">Email:</span>
                                    <span className="text-muted-foreground">{user.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Status:</span>
                                    <span className="text-green-600 font-semibold">✓ Verified</span>
                                </div>
                                {user.email_verified_at && (
                                    <div className="flex justify-between">
                                        <span className="font-medium">Verified At:</span>
                                        <span className="text-muted-foreground">
                                            {new Date(user.email_verified_at).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>OTP Authentication System</CardTitle>
                            <CardDescription>Features of this system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                                <li>6-digit OTP verification</li>
                                <li>5-minute OTP expiry</li>
                                <li>Maximum 3 verification attempts</li>
                                <li>60-second resend cooldown</li>
                                <li>Email verification required for login</li>
                                <li>Secure token-based authentication</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
