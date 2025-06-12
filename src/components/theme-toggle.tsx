'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>('system');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement;
        
        if (newTheme === 'system') {
            root.classList.remove('light', 'dark');
        } else {
            root.classList.remove('light', 'dark');
            root.classList.add(newTheme);
        }
    };

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    if (!mounted) {
        return (
            <div className="theme-button-secondary px-3 py-2">
                <span className="text-sm">🌗</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 theme-card p-1">
            <button
                onClick={() => handleThemeChange('light')}
                className={`px-3 py-1 text-sm rounded transition-all ${
                    theme === 'light'
                        ? 'theme-button-primary'
                        : 'theme-button-secondary'
                }`}
                title="浅色主题"
            >
                ☀️
            </button>
            <button
                onClick={() => handleThemeChange('dark')}
                className={`px-3 py-1 text-sm rounded transition-all ${
                    theme === 'dark'
                        ? 'theme-button-primary'
                        : 'theme-button-secondary'
                }`}
                title="深色主题"
            >
                🌙
            </button>
            <button
                onClick={() => handleThemeChange('system')}
                className={`px-3 py-1 text-sm rounded transition-all ${
                    theme === 'system'
                        ? 'theme-button-primary'
                        : 'theme-button-secondary'
                }`}
                title="跟随系统"
            >
                🖥️
            </button>
        </div>
    );
} 