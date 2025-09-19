import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, Calendar, BarChart3, Shield, Headphones, Heart, Smartphone, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { LoginModal } from "@/pages/LoginModal";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import React from "react";
import heroMusic from "@/assets/hero-music.jpg";

const Landing = () => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <Music className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Tocafy</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </a>
          </nav>
          <Button variant="musical" onClick={() => setShowLoginModal(true)}>
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroMusic})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Conecte-se com sua
            <span className="block text-primary">Plateia ao Vivo</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90">
            O Tocafy permite que sua plateia peça músicas em tempo real durante shows. 
            Gerencie pedidos, organize setlists e mantenha a energia da festa sempre alta!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="musical" className="text-lg px-8 py-3" onClick={() => setShowLoginModal(true)}>
              Criar Meu Show
            </Button>
            <Link to="/audience">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white/30 text-white hover:bg-white/10">
                Fazer Pedido Musical
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como funciona o Tocafy?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma experiência interativa que conecta artistas e plateia de forma única
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>1. Artista Cria o Show</CardTitle>
                <CardDescription>
                  Configure seu show no painel e gere um QR Code para sua plateia acessar
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>2. Plateia Faz Pedidos</CardTitle>
                <CardDescription>
                  Público escaneia o QR Code e pede suas músicas favoritas pelo celular
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Music className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>3. Controle da Setlist</CardTitle>
                <CardDescription>
                  Veja todos os pedidos em tempo real e organize sua apresentação
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>4. Plateia Engajada</CardTitle>
                <CardDescription>
                  Público vota nas músicas favoritas e acompanha o que está tocando
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>5. Relatórios Completos</CardTitle>
                <CardDescription>
                  Analise quais músicas foram mais pedidas e o engajamento do público
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>6. Moderação Inteligente</CardTitle>
                <CardDescription>
                  Filtre pedidos inadequados e mantenha o controle total do seu show
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Transforme seus shows em experiências únicas!
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Milhares de artistas já conectam com sua plateia através do Tocafy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" onClick={() => setShowLoginModal(true)}>
              Criar Meu Show Grátis
            </Button>
            <Link to="/audience">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white/30 text-white hover:bg-white/20">
                Fazer Pedido Musical
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Music className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Tocafy</span>
            </div>
            <p className="text-muted-foreground text-center">
              © 2024 Tocafy. Conectando artistas e plateia através da música.
            </p>
          </div>
        </div>
      </footer>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
};

export default Landing;