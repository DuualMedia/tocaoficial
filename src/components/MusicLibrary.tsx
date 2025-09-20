import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Search, Plus, Edit, Trash2, Play } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DeezerSearch } from "@/components/DeezerSearch";

interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  genre?: string;
  created_at: string;
  deezer_id?: string;
  preview_url?: string;
  cover_url?: string;
}

export const MusicLibrary = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSong, setNewSong] = useState({ title: "", artist: "", key: "", genre: "" });

  // Fetch songs from database
  useEffect(() => {
    if (!user || !profile) return;
    
    const fetchSongs = async () => {
      try {
        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .eq('artist_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSongs(data || []);
      } catch (error) {
        console.error('Error fetching songs:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as músicas.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [user, profile]);

  const handleAddSong = async () => {
    if (!user || !profile) return;
    
    try {
      const { error } = await supabase
        .from('songs')
        .insert({
          title: newSong.title,
          artist: newSong.artist,
          key: newSong.key,
          genre: newSong.genre || null,
          artist_id: profile.id,
        });

      if (error) throw error;

      toast({
        title: "Música adicionada!",
        description: `${newSong.title} foi adicionada à sua biblioteca.`,
      });

      setIsAddOpen(false);
      setNewSong({ title: "", artist: "", key: "", genre: "" });
      
      // Refresh songs list
      const { data } = await supabase
        .from('songs')
        .select('*')
        .eq('artist_id', profile.id)
        .order('created_at', { ascending: false });
      
      setSongs(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar música.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSong = async (songId: string, songTitle: string) => {
    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId);

      if (error) throw error;

      setSongs(songs.filter(song => song.id !== songId));
      toast({
        title: "Música removida",
        description: `${songTitle} foi removida da sua biblioteca.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover música.",
        variant: "destructive"
      });
    }
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Biblioteca Musical</h2>
          <p className="text-muted-foreground">Gerencie seu acervo de músicas</p>
        </div>
        <Button variant="musical" size="lg" onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Música
        </Button>
      </div>

      {/* Search and Tabs */}
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library">Minha Biblioteca</TabsTrigger>
          <TabsTrigger value="search">Buscar no Deezer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="library" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por título ou artista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>

          {/* Songs Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando músicas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSongs.map((song) => (
                <Card key={song.id} className="bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {song.cover_url && (
                          <img
                            src={song.cover_url}
                            alt={`${song.title} cover`}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold line-clamp-1">
                            {song.title}
                          </CardTitle>
                          <p className="text-muted-foreground text-sm">{song.artist}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {song.preview_url && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => window.open(song.preview_url, '_blank')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                        {song.key || 'Sem tom'}
                      </Badge>
                      {song.genre && (
                        <Badge variant="secondary" className="bg-secondary/50">
                          {song.genre}
                        </Badge>
                      )}
                      {song.deezer_id && (
                        <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
                          Deezer
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(song.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSong(song.id, song.title)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredSongs.length === 0 && (
            <div className="text-center py-12">
              <Music className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma música encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Tente uma busca diferente" : "Comece adicionando sua primeira música"}
              </p>
              {!searchTerm && (
                <Button variant="musical" onClick={() => setIsAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeira Música
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <DeezerSearch />
        </TabsContent>
      </Tabs>


      {/* Add Song Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="add-song-description">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Música</DialogTitle>
            <p id="add-song-description" className="text-sm text-muted-foreground">
              Preencha os campos abaixo para adicionar uma nova música à sua biblioteca
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newSong.title}
                onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                placeholder="Nome da música"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artista</Label>
              <Input
                id="artist"
                value={newSong.artist}
                onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                placeholder="Nome do artista"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">Tom</Label>
              <Input
                id="key"
                value={newSong.key}
                onChange={(e) => setNewSong({ ...newSong, key: e.target.value })}
                placeholder="Ex: Am, C, G"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Gênero (opcional)</Label>
              <Input
                id="genre"
                value={newSong.genre}
                onChange={(e) => setNewSong({ ...newSong, genre: e.target.value })}
                placeholder="Rock, Pop, etc."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddSong} 
              disabled={!newSong.title || !newSong.artist || !newSong.key}
            >
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};