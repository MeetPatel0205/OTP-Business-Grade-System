'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { passwordAPI } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await passwordAPI.forgot(email);
            if (response.data.success) {
                toast.success(response.data.message);
                router.push(`/reset-verify-otp?email=${encodeURIComponent(email)}`);
            } else {
                toast.error(response.data.message);
                setError(response.data.message);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Forgot Password"
            description="Enter your email to receive a verification code"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                </Button>

                <div className="text-center text-sm">
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Back to Login
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
