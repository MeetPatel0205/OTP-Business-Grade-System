'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-bold tracking-tight">
            OTP Verification System
          </CardTitle>
          <CardDescription className="text-lg">
            Secure authentication with email-based OTP verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ 6-digit OTP verification</li>
                <li>✓ 5-minute expiry time</li>
                <li>✓ 3 verification attempts</li>
                <li>✓ 60-second resend cooldown</li>
                <li>✓ Secure token authentication</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Technology Stack</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Next.js 14 + TypeScript</li>
                <li>• Laravel 10 API</li>
                <li>• MySQL Database</li>
                <li>• Tailwind CSS + shadcn/ui</li>
                <li>• Laravel Sanctum Auth</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Register
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Login
              </Button>
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground pt-4">
            Built with business-grade security and best practices
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
