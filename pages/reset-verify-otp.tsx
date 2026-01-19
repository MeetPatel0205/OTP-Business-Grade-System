import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { passwordAPI } from '@/lib/api';
import { ResendTimer } from '@/components/ui/resend-timer';

// Assuming ResendTimer is a component that accepts onResend and initialTime
// If not, we might need to adjust or create a simple one here. 
// For now, I'll assume the user has a ResendTimer component or I will build a simple logic.
// The prompted ResendTimer exists: d:\OTP Validation\frontend\components\ui\resend-timer.tsx

export default function ResetVerifyOtp() {
    const router = useRouter();
    const { email } = router.query;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Ensure email is available
    useEffect(() => {
        if (!router.isReady) return;
        if (!email) {
            router.push('/forgot-password');
        }
    }, [router.isReady, email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || typeof email !== 'string') return;

        setLoading(true);
        try {
            const response = await passwordAPI.verifyOtp({ email, otp });
            if (response.data.success) {
                toast.success(response.data.message);
                // Pass email and OTP to the next step via query or state?
                // Usually, we pass the code to the next step to verify it again with the password reset request.
                router.push(`/set-new-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
            } else {
                toast.error(response.data.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email || typeof email !== 'string') return;

        try {
            const response = await passwordAPI.resendOtp(email);
            if (response.data.success) {
                toast.success(response.data.message);
                return true;
            } else {
                toast.error(response.data.message);
                return false;
            }
        } catch (error: any) {
            // If 429, handle specific message
            if (error.response?.status === 429) {
                toast.error(error.response.data.message);
                return false;
            }
            toast.error('Failed to resend OTP');
            return false;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verify OTP
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter the 6-digit code sent to {email}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="otp" className="sr-only">
                                OTP Code
                            </label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                maxLength={6}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center tracking-widest text-2xl"
                                placeholder="******"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                        </div>
                    </div>


                    <div className="flex justify-center">
                        <ResendTimer onResend={handleResend} />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${(loading || otp.length !== 6) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
