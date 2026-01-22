'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OtpInput } from '@/components/ui/otp-input';
import { ResendTimer } from '@/components/ui/resend-timer';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

function VerifyOtpContent() {
    const router = useRouter();
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attemptCount, setAttemptCount] = useState(0);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authAPI.verifyOtp(email, otp);

            if (response.data.success) {
                toast.success(response.data.message);

                // Store token and user data via Context (updates state immediately)
                if (response.data.token) {
                    login(response.data.token, response.data.user);
                    // Redirect to dashboard (replace history to prevent back loop)
                    router.replace('/dashboard');
                } else {
                    router.push('/login');
                }
            }
        } catch (err: any) {
            const errorData = err.response?.data;
            const errorMessage = errorData?.message || 'Verification failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);

            if (errorData?.remaining_attempts !== undefined) {
                setAttemptCount(3 - errorData.remaining_attempts);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setError('');
        setOtp('');

        try {
            const response = await authAPI.resendOtp(email);

            if (response.data.success) {
                toast.success(response.data.message);
                setAttemptCount(0);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to resend OTP.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <AuthLayout title="Verify OTP">
                <Alert variant="destructive">
                    <AlertDescription>Email address is required. Please register or login first.</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button onClick={() => router.push('/register')} className="w-full">
                        Go to Register
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Verify Your Email"
            description={`Enter the 6-digit OTP sent to ${email}`}
        >
            <div className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {attemptCount > 0 && (
                    <Alert>
                        <AlertDescription>
                            Attempts used: {attemptCount}/3
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <OtpInput
                        length={6}
                        value={otp}
                        onChange={setOtp}
                        disabled={loading}
                    />

                    <Button
                        onClick={handleVerify}
                        className="w-full"
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                </div>

                <div className="text-center">
                    <ResendTimer
                        initialSeconds={60}
                        onResend={handleResend}
                        disabled={loading}
                    />
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Didn't receive the code? Check your spam folder or click resend above.
                </p>
            </div>
        </AuthLayout>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}
