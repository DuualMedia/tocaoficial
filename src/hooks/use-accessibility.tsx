import { useState, useEffect, createContext, useContext } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  fontSize: number;
  reducedMotion: boolean;
  darkMode: "light" | "dark" | "system";
  screenReader: boolean;
  soundNotifications: boolean;
  colorBlindFriendly: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  fontSize: 16,
  reducedMotion: false,
  darkMode: "system",
  screenReader: false,
  soundNotifications: true,
  colorBlindFriendly: false
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: defaultSettings,
  updateSetting: () => {},
  resetSettings: () => {}
});

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('tocafy-accessibility');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('tocafy-accessibility', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('tocafy-accessibility', JSON.stringify(defaultSettings));
  };

  // Apply settings to DOM
  useEffect(() => {
    const body = document.body;
    
    // High Contrast
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    
    // Large Text
    if (settings.largeText) {
      body.classList.add('large-text');
    } else {
      body.classList.remove('large-text');
    }
    
    // Font Size
    body.style.fontSize = `${settings.fontSize}px`;
    
    // Reduced Motion
    if (settings.reducedMotion) {
      body.style.setProperty('--transition-smooth', 'none');
      body.style.setProperty('--transition-bounce', 'none');
    } else {
      body.style.removeProperty('--transition-smooth');
      body.style.removeProperty('--transition-bounce');
    }
    
    // Dark Mode
    if (settings.darkMode === 'dark') {
      body.classList.add('dark');
    } else if (settings.darkMode === 'light') {
      body.classList.remove('dark');
    }
    // System theme is handled by the browser
  }, [settings]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};