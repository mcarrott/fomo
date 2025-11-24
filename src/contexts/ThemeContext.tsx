import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  gradientColor1: string;
  gradientColor2: string;
  gradientAngle: number;
  setGradient: (color1: string, color2: string, angle: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState('light');
  const [gradientColor1, setGradientColor1] = useState('#FFC4DD');
  const [gradientColor2, setGradientColor2] = useState('#D4C4F5');
  const [gradientAngle, setGradientAngle] = useState(135);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('theme, gradient_color_1, gradient_color_2, gradient_angle')
      .limit(1)
      .maybeSingle();

    if (data?.theme) {
      setThemeState(data.theme);
      applyTheme(data.theme);
    }

    if (data?.gradient_color_1) {
      setGradientColor1(data.gradient_color_1);
    }
    if (data?.gradient_color_2) {
      setGradientColor2(data.gradient_color_2);
    }
    if (data?.gradient_angle !== null && data?.gradient_angle !== undefined) {
      setGradientAngle(data.gradient_angle);
    }

    applyGradient(
      data?.gradient_color_1 || '#FFC4DD',
      data?.gradient_color_2 || '#D4C4F5',
      data?.gradient_angle ?? 135
    );
  };

  const applyTheme = (selectedTheme: string) => {
    if (selectedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const applyGradient = (color1: string, color2: string, angle: number) => {
    document.documentElement.style.setProperty('--gradient-color-1', color1);
    document.documentElement.style.setProperty('--gradient-color-2', color2);
    document.documentElement.style.setProperty('--gradient-angle', `${angle}deg`);
  };

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const setGradient = (color1: string, color2: string, angle: number) => {
    setGradientColor1(color1);
    setGradientColor2(color2);
    setGradientAngle(angle);
    applyGradient(color1, color2, angle);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, gradientColor1, gradientColor2, gradientAngle, setGradient }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
