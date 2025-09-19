import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, EyeOff, Music, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'audience' as 'artist' | 'audience'
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
        onOpenChange(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        navigate('/dashboard');
        onOpenChange(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, onOpenChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao Tocafy.",
        });
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("As senhas não coincidem");
        }

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: formData.displayName,
              role: formData.role
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0">
        <div className="flex min-h-[500px]">
          {/* Left side - Branding */}
          <div className="flex-1 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-12 text-white relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-8">
                <Music className="h-16 w-16 mr-4" />
                <h1 className="text-5xl font-bold">Tocafy</h1>
              </div>
              <h2 className="text-2xl font-semibold mb-4">Conecte-se ao Futuro</h2>
              <p className="text-lg mb-6">
                A maneira mais eficiente de conectar artistas e plateia através da música inteligente.
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-white/60"></div>
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <div className="w-3 h-3 rounded-full bg-white/60"></div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex-1 p-8 bg-background flex items-center justify-center">
            <Card className="w-full max-w-md border-0 shadow-none">
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Bem-vindo</h3>
                  <p className="text-muted-foreground">Entre para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Nome</Label>
                        <Input
                          id="displayName"
                          name="displayName"
                          type="text"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          required={!isLogin}
                          placeholder="Seu nome"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Tipo de Conta</Label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <option value="audience">Plateia</option>
                          <option value="artist">Artista</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Sua senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required={!isLogin}
                        placeholder="Confirme sua senha"
                      />
                    </div>
                  )}

                  {isLogin && (
                    <div className="text-right">
                      <Button variant="link" type="button" className="p-0 h-auto text-sm">
                        Esqueceu Senha?
                      </Button>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={loading}
                  >
                    {loading 
                      ? (isLogin ? 'Entrando...' : 'Criando conta...') 
                      : (isLogin ? 'Login' : 'Criar Conta')
                    }
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <Button
                    variant="link"
                    className="text-primary font-medium"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'CADASTRE-SE DE GRAÇA' : 'Já tem conta? Fazer login'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};