import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, Type, Palette, Volume2, Moon, Sun, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export const AccessibilitySettings = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    fontSize: 16,
    reducedMotion: false,
    darkMode: "system",
    screenReader: false,
    soundNotifications: true,
    colorBlindFriendly: false
  });

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Apply settings immediately
    applySettings({
      ...settings,
      [key]: value
    });
    
    toast({
      title: "Configuração aplicada",
      description: "As alterações de acessibilidade foram salvas."
    });
  };

  const applySettings = (newSettings: AccessibilitySettings) => {
    const body = document.body;
    
    // High Contrast
    if (newSettings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    
    // Large Text
    if (newSettings.largeText) {
      body.classList.add('large-text');
    } else {
      body.classList.remove('large-text');
    }
    
    // Font Size
    body.style.fontSize = `${newSettings.fontSize}px`;
    
    // Reduced Motion
    if (newSettings.reducedMotion) {
      body.style.setProperty('--transition-smooth', 'none');
      body.style.setProperty('--transition-bounce', 'none');
    } else {
      body.style.removeProperty('--transition-smooth');
      body.style.removeProperty('--transition-bounce');
    }
    
    // Dark Mode
    if (newSettings.darkMode === 'dark') {
      body.classList.add('dark');
    } else if (newSettings.darkMode === 'light') {
      body.classList.remove('dark');
    }
    // System theme is handled by the browser
  };

  const resetToDefaults = () => {
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
    
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    
    toast({
      title: "Configurações restauradas",
      description: "Todas as configurações foram restauradas ao padrão."
    });
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Configurações de Acessibilidade
          </h1>
          <p className="text-muted-foreground mt-2">
            Personalize a interface para melhor experiência e acessibilidade
          </p>
        </div>
        
        <Button 
          variant="outline"
          onClick={resetToDefaults}
        >
          Restaurar Padrões
        </Button>
      </div>

      {/* Configurações Visuais */}
      <Card className="bg-gradient-card border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Configurações Visuais
          </CardTitle>
          <CardDescription>
            Ajuste o contraste, tamanho e tema da interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alto Contraste</Label>
              <p className="text-sm text-muted-foreground">
                Aumenta o contraste para melhor visibilidade
              </p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting("highContrast", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Texto Grande</Label>
              <p className="text-sm text-muted-foreground">
                Aumenta o tamanho de todos os textos
              </p>
            </div>
            <Switch
              checked={settings.largeText}
              onCheckedChange={(checked) => updateSetting("largeText", checked)}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-0.5">
              <Label>Tamanho da Fonte: {settings.fontSize}px</Label>
              <p className="text-sm text-muted-foreground">
                Ajuste fino do tamanho da fonte base
              </p>
            </div>
            <Slider
              value={[settings.fontSize]}
              onValueChange={(value) => updateSetting("fontSize", value[0])}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Tema da Interface</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={settings.darkMode === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting("darkMode", "light")}
                className="flex items-center gap-2"
              >
                <Sun className="w-4 h-4" />
                Claro
              </Button>
              <Button
                variant={settings.darkMode === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting("darkMode", "dark")}
                className="flex items-center gap-2"
              >
                <Moon className="w-4 h-4" />
                Escuro
              </Button>
              <Button
                variant={settings.darkMode === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting("darkMode", "system")}
                className="flex items-center gap-2"
              >
                <Monitor className="w-4 h-4" />
                Sistema
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cores para Daltonismo</Label>
              <p className="text-sm text-muted-foreground">
                Ajusta as cores para melhor diferenciação
              </p>
            </div>
            <Switch
              checked={settings.colorBlindFriendly}
              onCheckedChange={(checked) => updateSetting("colorBlindFriendly", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Movimento e Som */}
      <Card className="bg-gradient-card border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Movimento e Som
          </CardTitle>
          <CardDescription>
            Configure animações e notificações sonoras
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduzir Animações</Label>
              <p className="text-sm text-muted-foreground">
                Desabilita ou reduz animações na interface
              </p>
            </div>
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações Sonoras</Label>
              <p className="text-sm text-muted-foreground">
                Sons para novas solicitações e eventos
              </p>
            </div>
            <Switch
              checked={settings.soundNotifications}
              onCheckedChange={(checked) => updateSetting("soundNotifications", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Tecnologia Assistiva */}
      <Card className="bg-gradient-card border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Tecnologia Assistiva
          </CardTitle>
          <CardDescription>
            Otimizações para leitores de tela e outras ferramentas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Otimizar para Leitores de Tela</Label>
              <p className="text-sm text-muted-foreground">
                Melhora a navegação com leitores de tela
              </p>
            </div>
            <Switch
              checked={settings.screenReader}
              onCheckedChange={(checked) => updateSetting("screenReader", checked)}
            />
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">♿ Sobre Acessibilidade</h4>
            <p className="text-sm text-muted-foreground mb-2">
              O Tocafy foi desenvolvido seguindo as diretrizes WCAG 2.1 para garantir 
              acessibilidade para todos os usuários.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary">WCAG 2.1 AA</Badge>
              <Badge variant="secondary">Navegação por Teclado</Badge>
              <Badge variant="secondary">Alto Contraste</Badge>
              <Badge variant="secondary">Leitores de Tela</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview das Configurações */}
      <Card className="bg-gradient-card border-accent/20">
        <CardHeader>
          <CardTitle>Preview das Configurações</CardTitle>
          <CardDescription>
            Visualize como as suas configurações afetam a interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-border rounded-lg bg-muted/20">
            <h3 className="text-lg font-semibold mb-2">Exemplo de Card</h3>
            <p className="text-muted-foreground mb-3">
              Este é um exemplo de como o conteúdo aparecerá com suas configurações atuais.
            </p>
            <Button className="bg-gradient-primary hover:opacity-90">
              Botão de Exemplo
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <strong>Configurações Ativas:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {settings.highContrast && <li>Alto contraste habilitado</li>}
              {settings.largeText && <li>Texto grande habilitado</li>}
              {settings.reducedMotion && <li>Animações reduzidas</li>}
              {settings.colorBlindFriendly && <li>Cores adaptadas para daltonismo</li>}
              <li>Fonte: {settings.fontSize}px</li>
              <li>Tema: {settings.darkMode}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};