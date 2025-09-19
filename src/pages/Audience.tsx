import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Music, Search, Star, ThumbsUp, Users, Send, Clock, Volume2, Camera, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QRScanner } from "@/components/QRScanner";

interface Show {
  id: string;
  name: string;
  artist: {
    display_name: string;
  };
  status: 'draft' | 'live' | 'paused' | 'ended';
}

interface Song {
  id: string;
  title: string;
  artist: string;
  key?: string;
}

interface SongRequest {
  id: string;
  song?: Song;
  custom_song_title?: string;
  custom_song_artist?: string;
  requester_name: string;
  message?: string;
  status: 'pending' | 'accepted' | 'playing' | 'played' | 'skipped';
  tip_amount: number;
  position_in_queue?: number;
  created_at: string;
}

const Audience = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCode, setShowCode] = useState('');
  const [connectedShow, setConnectedShow] = useState<Show | null>(null);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [upcomingRequests, setUpcomingRequests] = useState<SongRequest[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<SongRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [requestForm, setRequestForm] = useState({
    requesterName: '',
    message: '',
    tipAmount: 0
  });
  const { toast } = useToast();

  // Connect to show if showId is in URL
  useEffect(() => {
    if (showId) {
      connectToShowByCode(showId);
    }
  }, [showId]);

  // Connect to show by username code or URL
  const connectToShowByCode = async (code: string) => {
    setLoading(true);
    try {
      // First try to connect by username_code
      let { data: show, error } = await supabase
        .from('shows')
        .select(`
          id,
          name,
          status,
          username_code,
          artist:profiles(display_name)
        `)
        .eq('username_code', code)
        .eq('status', 'live')
        .single();

      // If not found by username_code, try by UUID (for backward compatibility)
      if (error && code.length === 36) {
        const { data: showById, error: errorById } = await supabase
          .from('shows')
          .select(`
            id,
            name,
            status,
            username_code,
            artist:profiles(display_name)
          `)
          .eq('id', code)
          .eq('status', 'live')
          .single();

        if (!errorById) {
          show = showById;
          error = null;
        }
      }

      if (error || !show) {
        throw new Error('Show não encontrado ou não está ao vivo');
      }

      setConnectedShow(show);
      await loadShowData(show.id);
      
      toast({
        title: "Conectado com sucesso!",
        description: `Você está conectado ao show "${show.name}"`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao conectar",
        description: error.message || "Não foi possível conectar ao show.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load show data
  const connectToShow = async (id: string) => {
    setLoading(true);
    try {
      const { data: show, error } = await supabase
        .from('shows')
        .select(`
          id,
          name,
          status,
          artist:profiles(display_name)
        `)
        .eq('id', id)
        .eq('status', 'live')
        .single();

      if (error || !show) {
        throw new Error('Show não encontrado ou não está ao vivo');
      }

      setConnectedShow(show);
      await loadShowData(id);
      
      toast({
        title: "Conectado com sucesso!",
        description: `Você está conectado ao show "${show.name}"`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao conectar",
        description: error.message || "Não foi possível conectar ao show.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadShowData = async (showId: string) => {
    // Load available songs
    const { data: songs } = await supabase
      .from('songs')
      .select('*')
      .eq('is_available', true);

    if (songs) setAvailableSongs(songs);

    // Load current requests
    const { data: requests } = await supabase
      .from('song_requests')
      .select(`
        *,
        song:songs(id, title, artist),
        requester:profiles(display_name)
      `)
      .eq('show_id', showId)
      .order('position_in_queue', { ascending: true });

    if (requests) {
      const playing = requests.find(r => r.status === 'playing');
      const upcoming = requests.filter(r => r.status === 'pending' || r.status === 'accepted');
      
      setCurrentlyPlaying(playing || null);
      setUpcomingRequests(upcoming);
    }
  };

  // Real-time updates
  useEffect(() => {
    if (!connectedShow) return;

    const channel = supabase
      .channel('audience-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'song_requests',
          filter: `show_id=eq.${connectedShow.id}`
        },
        () => loadShowData(connectedShow.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectedShow]);

  const handleConnectToShow = () => {
    if (showCode.trim()) {
      connectToShowByCode(showCode);
    }
  };

  const handleQRScanSuccess = (decodedText: string) => {
    setShowQRScanner(false);
    
    // Extract show code from URL or use directly if it's just a code
    let code = decodedText;
    if (decodedText.includes('/show/')) {
      code = decodedText.split('/show/')[1];
    } else if (decodedText.includes('/audience/')) {
      code = decodedText.split('/audience/')[1];
    } else if (decodedText.startsWith('http')) {
      // Try to extract from any URL pattern
      const urlParts = decodedText.split('/');
      code = urlParts[urlParts.length - 1];
    }
    
    if (code) {
      setShowCode(code);
      connectToShowByCode(code);
    } else {
      toast({
        title: "QR Code inválido",
        description: "Não foi possível extrair o código do show do QR Code.",
        variant: "destructive"
      });
    }
  };

  const handleRequestSong = async (song: Song, isCustom = false) => {
    if (!connectedShow || !requestForm.requesterName.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Preencha seu nome para fazer o pedido.",
        variant: "destructive"
      });
      return;
    }

    try {
      const requestData = {
        show_id: connectedShow.id,
        requester_name: requestForm.requesterName,
        message: requestForm.message || null,
        tip_amount: requestForm.tipAmount,
        ...(isCustom ? {
          custom_song_title: song.title,
          custom_song_artist: song.artist
        } : {
          song_id: song.id
        })
      };

      const { error } = await supabase
        .from('song_requests')
        .insert([requestData]);

      if (error) throw error;

      // Update queue positions
      await supabase.rpc('update_queue_positions', { 
        show_uuid: connectedShow.id 
      });

      toast({
        title: "Música solicitada!",
        description: `"${song.title}" foi adicionada à fila de pedidos.`,
      });

      // Reset form
      setRequestForm(prev => ({
        ...prev,
        message: '',
        tipAmount: 0
      }));

    } catch (error: any) {
      toast({
        title: "Erro ao solicitar música",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredSongs = availableSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If not connected to a show, show connection screen
  if (!connectedShow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Music className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Conectar ao Show</CardTitle>
              <p className="text-muted-foreground">
                Digite o código do show para participar
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requesterName">Seu nome</Label>
                <Input
                  id="requesterName"
                  placeholder="Como você gostaria de ser chamado?"
                  value={requestForm.requesterName}
                  onChange={(e) => setRequestForm(prev => ({
                    ...prev,
                    requesterName: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="showCode">Código do show</Label>
                <div className="flex gap-2">
                  <Input
                    id="showCode"
                    placeholder="Digite o código do show (ex: @joao_acustico)"
                    value={showCode}
                    onChange={(e) => setShowCode(e.target.value)}
                    className="text-center text-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowQRScanner(true)}
                    title="Escanear QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleConnectToShow}
                className="w-full"
                size="lg"
                disabled={loading || !requestForm.requesterName.trim()}
              >
                {loading ? 'Conectando...' : 'Conectar'}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <QRScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScanSuccess={handleQRScanSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Music className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{connectedShow.name}</h1>
              <p className="text-muted-foreground">por {connectedShow.artist.display_name}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Ao Vivo
          </Badge>
        </div>

        {/* Currently Playing */}
        {currentlyPlaying && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Volume2 className="h-5 w-5 mr-2" />
                Tocando Agora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {currentlyPlaying.song?.title || currentlyPlaying.custom_song_title}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentlyPlaying.song?.artist || currentlyPlaying.custom_song_artist}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pedido por {currentlyPlaying.requester_name}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">Em execução</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fazer Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem/Dedicação (opcional)</Label>
              <Textarea
                id="message"
                placeholder="Adicione uma mensagem ou dedicação..."
                value={requestForm.message}
                onChange={(e) => setRequestForm(prev => ({
                  ...prev,
                  message: e.target.value
                }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipAmount">Gorjeta (R$)</Label>
              <Input
                id="tipAmount"
                type="number"
                min="0"
                step="0.50"
                placeholder="0.00"
                value={requestForm.tipAmount || ''}
                onChange={(e) => setRequestForm(prev => ({
                  ...prev,
                  tipAmount: parseFloat(e.target.value) || 0
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar músicas para pedir..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Upcoming Songs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Próximas na Fila
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingRequests.length > 0 ? (
              <div className="space-y-3">
                {upcomingRequests.map((request, index) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{request.position_in_queue || index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {request.song?.title || request.custom_song_title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {request.song?.artist || request.custom_song_artist}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          por {request.requester_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.tip_amount > 0 && (
                        <Badge variant="outline" className="text-green-600">
                          R$ {request.tip_amount.toFixed(2)}
                        </Badge>
                      )}
                      <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'}>
                        {request.status === 'accepted' ? 'Aceito' : 'Aguardando'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma música na fila ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Available Songs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Músicas Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredSongs.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div>
                    <h4 className="font-medium">{song.title}</h4>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                    {song.key && (
                      <p className="text-xs text-muted-foreground">Tom: {song.key}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRequestSong(song)}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Pedir
                  </Button>
                </div>
              ))}
              {filteredSongs.length === 0 && searchQuery && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Nenhuma música encontrada</p>
                  <Button
                    variant="link"
                    onClick={() => setSearchQuery('')}
                    className="mt-2"
                  >
                    Ver todas as músicas
                  </Button>
                </div>
              )}
              {availableSongs.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Nenhuma música disponível no momento</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Audience;