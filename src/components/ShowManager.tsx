import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QrCode, Play, Pause, Square, Copy, Eye, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";

interface Show {
  id: string;
  name: string;
  status: "draft" | "live" | "paused" | "ended";
  createdAt: Date;
  shareUrl: string;
  requestCount: number;
  description?: string;
  location?: string;
}

export const ShowManager = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [newShowName, setNewShowName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchShows = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('shows')
        .select(`
          *,
          username_code,
          song_requests(count)
        `)
        .eq('artist_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const showsWithCount = data?.map(show => ({
        id: show.id,
        name: show.name,
        status: show.status,
        createdAt: new Date(show.created_at),
        shareUrl: `${window.location.origin}/audience/${show.username_code || show.id}`,
        requestCount: show.song_requests?.length || 0,
        description: show.description,
        location: show.location
      })) || [];

      setShows(showsWithCount);
    } catch (error: any) {
      console.error('Erro ao buscar shows:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os shows.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createShow = async () => {
    if (!newShowName.trim() || !profile?.id || !profile?.username) {
      if (!profile?.username) {
        toast({
          title: "Username necessário",
          description: "Configure seu username no perfil antes de criar shows.",
          variant: "destructive"
        });
      }
      return;
    }
    
    setIsCreating(true);
    try {
      // Generate username code for the show
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_show_code', {
          artist_username: profile.username,
          show_name: newShowName
        });

      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from('shows')
        .insert({
          name: newShowName,
          artist_id: profile.id,
          status: 'draft',
          username_code: codeData
        })
        .select()
        .single();

      if (error) throw error;

      const newShow: Show = {
        id: data.id,
        name: data.name,
        status: data.status,
        createdAt: new Date(data.created_at),
        shareUrl: `${window.location.origin}/audience/${data.username_code || data.id}`,
        requestCount: 0
      };
      
      setShows([newShow, ...shows]);
      setNewShowName("");
      
      toast({
        title: "Show criado!",
        description: `Código do show: @${data.username_code}`
      });
    } catch (error: any) {
      console.error('Erro ao criar show:', error);
      toast({
        title: "Erro",
        description: error.message === 'duplicate key value violates unique constraint "profiles_username_key"' ? 
          "Este username já está em uso." : "Não foi possível criar o show.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateShowStatus = async (id: string, status: Show["status"]) => {
    try {
      const updateData: any = { status };
      
      if (status === 'live') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'ended') {
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('shows')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setShows(shows.map(show => 
        show.id === id ? { ...show, status } : show
      ));
      
      const statusMessages = {
        live: "Show iniciado!",
        paused: "Show pausado",
        ended: "Show encerrado"
      };
      
      toast({
        title: statusMessages[status],
        description: status === "live" ? "A plateia já pode fazer pedidos!" : undefined
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do show.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchShows();
    }
  }, [profile?.id]);

  const copyShareUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "O link do show foi copiado para a área de transferência."
    });
  };

  const generateQRCode = async (url: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#6366f1',
          light: '#ffffff'
        }
      });
      
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>QR Code - Tocafy</title></head>
            <body style="display: flex; flex-direction: column; align-items: center; padding: 20px; font-family: system-ui;">
              <h2>Escaneie para fazer pedidos</h2>
              <img src="${qrDataUrl}" alt="QR Code" style="border: 1px solid #e5e7eb; border-radius: 8px;" />
              <p style="margin-top: 20px; color: #6b7280;">${url}</p>
              <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">Imprimir</button>
            </body>
          </html>
        `);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR Code.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: Show["status"]) => {
    switch (status) {
      case "live": return "bg-green-500";
      case "paused": return "bg-yellow-500";
      case "ended": return "bg-gray-500";
      default: return "bg-blue-500";
    }
  };

  const getStatusText = (status: Show["status"]) => {
    switch (status) {
      case "live": return "Ao Vivo";
      case "paused": return "Pausado";
      case "ended": return "Encerrado";
      default: return "Rascunho";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Gerenciar Shows
        </h1>
        <p className="text-muted-foreground mt-2">
          Crie shows, compartilhe links e gerencie pedidos em tempo real
        </p>
      </div>

      {/* Criar Novo Show */}
      <Card className="bg-gradient-card border-accent/20 hover-lift">
        <CardHeader>
          <CardTitle>Criar Novo Show</CardTitle>
          <CardDescription>
            Dê um nome ao seu show e comece a receber pedidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="showName">Nome do Show</Label>
              <Input
                id="showName"
                placeholder="Ex: Acústico no Bar Central"
                value={newShowName}
                onChange={(e) => setNewShowName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createShow()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={createShow}
                disabled={!newShowName.trim() || isCreating}
                className="bg-gradient-primary hover:opacity-90"
              >
                {isCreating ? "Criando..." : "Criar Show"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Shows */}
      <div className="grid gap-4">
        {shows.map((show) => (
          <Card key={show.id} className="bg-gradient-card border-accent/20 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{show.name}</h3>
                    <Badge className={`${getStatusColor(show.status)} text-white`}>
                      {getStatusText(show.status)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Criado em {show.createdAt.toLocaleDateString()} • {show.requestCount} pedidos
                  </p>
                </div>

                <div className="flex items-center gap-2 mobile-stack">
                  {/* Ações de Status */}
                  {show.status === "draft" && (
                    <Button 
                      size="sm" 
                      onClick={() => updateShowStatus(show.id, "live")}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Iniciar
                    </Button>
                  )}
                  
                  {show.status === "live" && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateShowStatus(show.id, "paused")}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Pausar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateShowStatus(show.id, "ended")}
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Encerrar
                      </Button>
                    </>
                  )}
                  
                  {show.status === "paused" && (
                    <Button 
                      size="sm" 
                      onClick={() => updateShowStatus(show.id, "live")}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Retomar
                    </Button>
                  )}

                  {/* Ações de Compartilhamento */}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyShareUrl(show.shareUrl)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar Link
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateQRCode(show.shareUrl)}
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    QR Code
                  </Button>

                  {/* Ir para o Modo Palco */}
                  {(show.status === "live" || show.status === "paused") && (
                    <Button 
                      size="sm"
                      onClick={() => window.open(`/stage/${show.id}`, '_blank')}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Modo Palco
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <Card className="bg-gradient-card border-accent/20">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Carregando shows...</p>
          </CardContent>
        </Card>
      )}

      {!loading && shows.length === 0 && (
        <Card className="bg-gradient-card border-accent/20">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum show criado</h3>
            <p className="text-muted-foreground">
              Crie seu primeiro show para começar a receber pedidos do público
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};