import { useState, useEffect, RefObject } from "react";

export const useKeyboardDetect = (textareaRef: RefObject<HTMLTextAreaElement | null>) => {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Improved mobile detection
        const isMobile = () => {
            return (
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                ) ||
                (navigator.maxTouchPoints &&
                    navigator.maxTouchPoints > 2 &&
                    /MacIntel/.test(navigator.platform)) || // iPad with iPadOS 13+
                window.matchMedia("(pointer: coarse)").matches
            );
        };

        // Store initial viewport height for better comparison
        const initialViewportHeight = window.innerHeight;
        const isIOSSafari =
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

        const onResize = () => {
            if (!isMobile()) return;

            const currentHeight = window.innerHeight;
            const visualHeight = window.visualViewport?.height ?? currentHeight;

            // Different thresholds for different browsers
            const threshold = isIOSSafari ? 150 : 100;
            const heightDiff = initialViewportHeight - visualHeight;

            // For iOS Safari, also check window.innerHeight changes
            const windowHeightDiff = initialViewportHeight - currentHeight;
            const effectiveDiff = Math.max(heightDiff, windowHeightDiff);

            if (effectiveDiff > threshold) {
                setIsKeyboardOpen(true);
            } else {
                setIsKeyboardOpen(false);
            }
        };

        // Alternative approach for Safari iOS using focus/blur events
        const onInputFocus = () => {
            if (isIOSSafari) {
                setTimeout(() => setIsKeyboardOpen(true), 300);
            }
        };

        const onInputBlur = () => {
            if (isIOSSafari) {
                setTimeout(() => setIsKeyboardOpen(false), 300);
            }
        };

        // Multiple event listeners for better Safari iOS support
        const events = ["resize", "orientationchange"];

        // Add visualViewport listeners if available
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", onResize);
            window.visualViewport.addEventListener("scroll", onResize);
        }

        // Add window event listeners as fallback and for iOS Safari
        events.forEach((event) => {
            window.addEventListener(event, onResize);
        });

        // Add focus/blur listeners for input elements (Safari iOS fallback)
        if (textareaRef.current) {
            textareaRef.current.addEventListener("focus", onInputFocus);
            textareaRef.current.addEventListener("blur", onInputBlur);
        }

        // Initial check
        onResize();

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener("resize", onResize);
                window.visualViewport.removeEventListener("scroll", onResize);
            }

            events.forEach((event) => {
                window.removeEventListener(event, onResize);
            });

            if (textareaRef.current) {
                textareaRef.current.removeEventListener("focus", onInputFocus);
                textareaRef.current.removeEventListener("blur", onInputBlur);
            }
        };
    }, [textareaRef]);

    return isKeyboardOpen;
};
