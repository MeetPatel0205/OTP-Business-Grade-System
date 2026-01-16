'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ResendTimerProps {
    initialSeconds?: number;
    onResend: () => void;
    disabled?: boolean;
}

export function ResendTimer({ initialSeconds = 60, onResend, disabled = false }: ResendTimerProps) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (seconds > 0) {
            const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [seconds]);

    const handleResend = () => {
        setSeconds(initialSeconds);
        setCanResend(false);
        onResend();
    };

    return (
        <div className="flex flex-col items-center gap-2">
            {!canResend ? (
                <p className="text-sm text-muted-foreground">
                    Resend OTP in <span className="font-semibold">{seconds}s</span>
                </p>
            ) : (
                <Button
                    type="button"
                    variant="link"
                    onClick={handleResend}
                    disabled={disabled}
                    className="text-primary"
                >
                    Resend OTP
                </Button>
            )}
        </div>
    );
}
