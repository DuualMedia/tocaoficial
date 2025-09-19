import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Music, Send, Clock, CheckCircle, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Song {
  id: string;
  title: string;
  artist: string;
  key?: string;
  isAvailable: boolean;
}

interface RequestForm {
  songId?: string;
  customSongTitle?: string;
  customSongArtist?: string;
  requesterName: string;
  message?: string;
  tipAmount?: number;
}

export default function PublicRequest() {
  const { showId } = useParams();
  const { toast } = useToast();
  
  const [showInfo, setShowInfo] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [requestForm, setRequestForm] = useState<RequestForm>({
    requesterName: "",
    message: "",
    tipAmount: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showId) {
      fetchShowData();
    }
  }, [showId]);

  const fetchShowData = async () => {
    try {
      // Buscar informações do show
      const { data: show, error: showError } = await supabase
        .from('shows')
        .select(`
          *,
          profiles(display_name, username),
          song_requests(count)
        `)
        .eq('id', showId)
        .single();

      if (showError) throw showError;

      if (show) {
        setShowInfo({
          ...show,
          artist: show.profiles?.display_name || show.profiles?.username || 'Artista',
          requestCount: show.song_requests?.length || 0
        });

        // Buscar repertório do artista se o show estiver ao vivo
        if (show.status === 'live') {
          const { data: songs, error: songsError } = await supabase
            .from('songs')
            .select('*')
            .eq('artist_id', show.artist_id)
            .eq('is_available', true);

          if (songsError) throw songsError;

          setSongs(songs?.map(song => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            key: song.key,
            isAvailable: song.is_available
          })) || []);
        }
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados do show:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as informações do show.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const submitRequest = async () => {
    if (!requestForm.requesterName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome para fazer o pedido.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedSong && (!requestForm.customSongTitle?.trim() || !requestForm.customSongArtist?.trim())) {
      toast({
        title: "Música obrigatória",
        description: "Selecione uma música ou digite título e artista da música personalizada.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('song_requests')
        .insert({
          show_id: showId,
          song_id: selectedSong?.id || null,
          custom_song_title: requestForm.customSongTitle || null,
          custom_song_artist: requestForm.customSongArtist || null,
          requester_name: requestForm.requesterName,
          message: requestForm.message || null,
          tip_amount: requestForm.tipAmount || 0,
          status: 'pending'
        });

      if (error) throw error;

      setHasSubmitted(true);

      toast({
        title: "Pedido enviado!",
        description: "Seu pedido foi enviado para o músico. Aguarde a aprovação."
      });

      // Reset form
      setSelectedSong(null);
      setRequestForm({
        requesterName: requestForm.requesterName, // Keep name for next request
        message: "",
        customSongTitle: "",
        customSongArtist: "",
        tipAmount: 0
      });
      setSearchTerm("");
    } catch (error: any) {
      console.error('Erro ao enviar pedido:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <h2 className="text-2xl font-semibold mb-2">Carregando...</h2>
            <p className="text-muted-foreground">
              Buscando informações do show
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!showInfo || showInfo.status !== "live") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Show Indisponível</h2>
            <p className="text-muted-foreground">
              Este show não está ativo no momento. Tente novamente mais tarde.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{showInfo.name}</CardTitle>
            <CardDescription className="text-white/80">
              com {showInfo.artist}
            </CardDescription>
            <div className="flex justify-center gap-4 mt-4">
              <Badge className="bg-green-500 text-white">
                🔴 Ao Vivo
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white">
                {showInfo.requestCount} pedidos feitos
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Success Message */}
        {hasSubmitted && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Pedido Enviado!
              </h3>
              <p className="text-green-700">
                Seu pedido foi enviado com sucesso. O músico irá avaliar e poderá tocar sua música em breve.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Request Form */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Fazer Pedido Musical
            </CardTitle>
            <CardDescription>
              Escolha uma música do repertório ou sugira uma nova
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nome do Solicitante */}
            <div>
              <Label htmlFor="requesterName">Seu Nome *</Label>
              <Input
                id="requesterName"
                placeholder="Como você quer ser chamado?"
                value={requestForm.requesterName}
                onChange={(e) => setRequestForm({
                  ...requestForm,
                  requesterName: e.target.value
                })}
              />
            </div>

            {/* Busca de Músicas */}
            <div>
              <Label htmlFor="songSearch">Buscar no Repertório</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="songSearch"
                  placeholder="Busque por título ou artista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lista de Músicas */}
            {searchTerm && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredSongs.map((song) => (
                  <Card 
                    key={song.id}
                    className={`cursor-pointer transition-all ${
                      selectedSong?.id === song.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-accent/50"
                    } ${!song.isAvailable ? "opacity-50" : ""}`}
                    onClick={() => song.isAvailable && setSelectedSong(song)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{song.title}</h4>
                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                        </div>
                        <div className="flex gap-2">
                          {song.key && (
                            <Badge variant="outline" className="text-xs">
                              {song.key}
                            </Badge>
                          )}
                          <Badge 
                            className={`text-xs ${
                              song.isAvailable 
                                ? "bg-green-500 text-white" 
                                : "bg-gray-500 text-white"
                            }`}
                          >
                            {song.isAvailable ? "Disponível" : "Indisponível"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredSongs.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma música encontrada
                  </p>
                )}
              </div>
            )}

            {/* Música Personalizada */}
            <div className="space-y-3">
              <Label>Ou digite uma música não listada</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Input
                    placeholder="Título da música"
                    value={requestForm.customSongTitle || ""}
                    onChange={(e) => {
                      setRequestForm({
                        ...requestForm,
                        customSongTitle: e.target.value
                      });
                      if (e.target.value) setSelectedSong(null);
                    }}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Artista"
                    value={requestForm.customSongArtist || ""}
                    onChange={(e) => {
                      setRequestForm({
                        ...requestForm,
                        customSongArtist: e.target.value
                      });
                      if (e.target.value) setSelectedSong(null);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Valor do PIX (opcional) */}
            <div>
              <Label htmlFor="tipAmount">PIX (Opcional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="tipAmount"
                  type="number"
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  value={requestForm.tipAmount || ""}
                  onChange={(e) => setRequestForm({
                    ...requestForm,
                    tipAmount: parseFloat(e.target.value) || 0
                  })}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Envie um PIX junto com seu pedido para ter prioridade na fila
              </p>
            </div>

            {/* Mensagem Opcional */}
            <div>
              <Label htmlFor="message">Mensagem (Opcional)</Label>
              <Textarea
                id="message"
                placeholder="Deixe uma mensagem para o músico..."
                value={requestForm.message}
                onChange={(e) => setRequestForm({
                  ...requestForm,
                  message: e.target.value
                })}
                rows={3}
              />
            </div>

            {/* Música Selecionada */}
            {selectedSong && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{selectedSong.title}</h4>
                      <p className="text-sm text-muted-foreground">{selectedSong.artist}</p>
                    </div>
                    {selectedSong.key && (
                      <Badge variant="outline">{selectedSong.key}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button 
              onClick={submitRequest}
              disabled={isSubmitting}
              className="w-full bg-gradient-primary hover:opacity-90"
              size="lg"
            >
              {isSubmitting ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Pedido
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-white/70 text-sm">
          <p>Powered by Tocafy 🎵</p>
        </div>
      </div>
    </div>
  );
}