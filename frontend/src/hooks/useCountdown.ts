'use client';

import { useState, useEffect } from 'react';

interface UseCountdownReturn {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    totalSeconds: number;
}

export function useCountdown(targetDate: string | Date): UseCountdownReturn {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const target = new Date(targetDate).getTime();
    const diff = Math.max(0, target - now);
    const totalSeconds = Math.floor(diff / 1000);

    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        isExpired: totalSeconds <= 0,
        totalSeconds,
    };
}
