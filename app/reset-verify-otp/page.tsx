'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { passwordAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ResendTimer } from '@/components/ui/resend-timer';

export default function ResetVerifyOtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!email) {
            router.push('/forgot-password');
        }
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');

        try {
            const response = await passwordAPI.verifyOtp({ email, otp });
            if (response.data.success) {
                toast.success(response.data.message);
                router.push(`/set-new-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
            } else {
                toast.error(response.data.message);
                setError(response.data.message);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Verification failed. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        try {
            const response = await passwordAPI.resendOtp(email);
            if (response.data.success) {
                toast.success(response.data.message);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to resend OTP.';
            toast.error(errorMessage);
        }
    };

    return (
        <AuthLayout
            title="Verify OTP"
            description={`Enter the 6-digit code sent to ${email}`}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="otp" className="sr-only">OTP Code</Label>
                    <Input
                        id="otp"
                        name="otp"
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        className="text-center text-2xl tracking-[1em] font-mono h-14"
                        required
                        maxLength={6}
                        disabled={loading}
                        autoFocus
                    />
                </div>

                <div className="flex justify-center">
                    <ResendTimer onResend={handleResend} />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || otp.length !== 6}
                >
                    {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
            </form>
        </AuthLayout>
    );
}
