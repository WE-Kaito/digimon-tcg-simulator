import { useState, useEffect, useRef } from 'react';

export default function useResponsiveFontSize(containerWidthDividedBy: number, maxWidth?: number) {
    const fontContainerRef = useRef<HTMLDivElement | null>(null);
    const [fontSize, setFontSize] = useState<number>(0);

    const calculateFontSize = () => {
        const container = fontContainerRef.current;
        if (container) {
            const newFontSize = Math.min(container.clientWidth / containerWidthDividedBy, maxWidth ?? 99);
            setFontSize(newFontSize);
        }
    };

    useEffect(() => {
        calculateFontSize();
        window.addEventListener('resize', calculateFontSize);
        return () => window.removeEventListener('resize', calculateFontSize);
    }, [containerWidthDividedBy, maxWidth]);

    return { fontSize, fontContainerRef };
}
