'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface QuizTimerState {
    /** Remaining seconds (countdown mode), or null if no time limit. */
    remainingSeconds: number | null;
    /** Elapsed seconds since quiz start. */
    elapsedSeconds: number;
    /** Whether the quiz has a time limit. */
    hasTimeLimit: boolean;
    /** Whether exam mode (fullscreen lockdown) is active. */
    examMode: boolean;
}

export interface QuizTimerActions {
    /** Start the timer. Pass minutes for countdown mode, omit for elapsed-only. */
    startTimer: (minutes?: number) => void;
    /** Stop all timers. */
    stopTimer: () => void;
    /** Enter exam mode (fullscreen + anti-cheat). */
    enterExamMode: () => void;
    /** Exit exam mode (exit fullscreen). */
    exitExamMode: () => void;
}

/**
 * Custom hook for quiz timer + exam mode anti-cheat.
 *
 * Handles:
 * - Countdown timer (when quiz has time limit)
 * - Elapsed timer (always runs during quiz)
 * - Exam mode: fullscreen API, copy/paste/right-click blocking
 */
export function useQuizTimer(): [QuizTimerState, QuizTimerActions] {
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
    const [hasTimeLimit, setHasTimeLimit] = useState(false);
    const [examMode, setExamMode] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (elapsedRef.current) {
            clearInterval(elapsedRef.current);
            elapsedRef.current = null;
        }
    }, []);

    const startTimer = useCallback((minutes?: number) => {
        stopTimer();
        // Always start elapsed timer
        setElapsedSeconds(0);
        elapsedRef.current = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);

        if (minutes && minutes > 0) {
            // Countdown mode
            setHasTimeLimit(true);
            const totalSeconds = minutes * 60;
            setRemainingSeconds(totalSeconds);
            timerRef.current = setInterval(() => {
                setRemainingSeconds(prev => {
                    if (prev === null || prev <= 1) {
                        stopTimer();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setHasTimeLimit(false);
            setRemainingSeconds(null);
        }
    }, [stopTimer]);

    // Cleanup on unmount
    useEffect(() => stopTimer, [stopTimer]);

    // Anti-cheat: block copy/paste/right-click/select/print-screen when exam mode is active
    useEffect(() => {
        if (!examMode) return;

        const blockEvent = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
        const blockKeyboard = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && ['c','v','a','p','s','x','u'].includes(e.key.toLowerCase())) ||
                e.key === 'PrintScreen' ||
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()))
            ) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        document.addEventListener('copy', blockEvent, true);
        document.addEventListener('cut', blockEvent, true);
        document.addEventListener('paste', blockEvent, true);
        document.addEventListener('contextmenu', blockEvent, true);
        document.addEventListener('selectstart', blockEvent, true);
        document.addEventListener('keydown', blockKeyboard, true);

        // Try fullscreen API
        const enterFullscreen = async () => {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
            } catch {
                // Fullscreen may be blocked by browser policy
            }
        };
        enterFullscreen();

        return () => {
            document.removeEventListener('copy', blockEvent, true);
            document.removeEventListener('cut', blockEvent, true);
            document.removeEventListener('paste', blockEvent, true);
            document.removeEventListener('contextmenu', blockEvent, true);
            document.removeEventListener('selectstart', blockEvent, true);
            document.removeEventListener('keydown', blockKeyboard, true);
        };
    }, [examMode]);

    const enterExamMode = useCallback(() => {
        setExamMode(true);
    }, []);

    const exitExamMode = useCallback(() => {
        setExamMode(false);
        try {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        } catch {
            // Ignore
        }
    }, []);

    const state: QuizTimerState = {
        remainingSeconds,
        elapsedSeconds,
        hasTimeLimit,
        examMode,
    };

    const actions: QuizTimerActions = {
        startTimer,
        stopTimer,
        enterExamMode,
        exitExamMode,
    };

    return [state, actions];
}
