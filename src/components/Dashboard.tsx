import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, ListMusic, Calendar, TrendingUp, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroMusic from "@/assets/hero-music.jpg";

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);
  const [newSong, setNewSong] = useState({ title: "", artist: "", key: "" });
  const [stats, setStats] = useState({
    songsCount: 0,
    showsCount: 0,
    monthlyShows: 0,
    totalRequests: 0
  });
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real stats from database
  useEffect(() => {
    if (!user || !profile) return;
    
    const fetchStats = async () => {
      try {
        // Get songs count
        const { count: songsCount } = await supabase
          .from('songs')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', profile.id);

        // Get shows count
        const { count: showsCount } = await supabase
          .from('shows')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', profile.id);

        // Get monthly shows
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const { count: monthlyShows } = await supabase
          .from('shows')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', profile.id)
          .gte('created_at', startOfMonth.toISOString());

        // Get total requests across all shows
        const { count: totalRequests } = await supabase
          .from('song_requests')
          .select('show_id', { count: 'exact', head: true })
          .in('show_id', 
            await supabase
              .from('shows')
              .select('id')
              .eq('artist_id', profile.id)
              .then(({ data }) => data?.map(show => show.id) || [])
          );

        setStats({
          songsCount: songsCount || 0,
          showsCount: showsCount || 0,
          monthlyShows: monthlyShows || 0,
          totalRequests: totalRequests || 0
        });

        // Get recent songs
        const { data: songs } = await supabase
          .from('songs')
          .select('title, artist, key')
          .eq('artist_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(3);

        setRecentSongs(songs || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, profile]);

  const handleAddMusic = async () => {
    if (!user || !profile) return;
    
    try {
      const { error } = await supabase
        .from('songs')
        .insert({
          title: newSong.title,
          artist: newSong.artist,
          key: newSong.key,
          artist_id: profile.id,
        });

      if (error) throw error;

      toast({
        title: "Música adicionada!",
        description: `${newSong.title} foi adicionada à sua biblioteca.`,
      });

      setIsAddMusicOpen(false);
      setNewSong({ title: "", artist: "", key: "" });
      
      // Refresh stats
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar música.",
        variant: "destructive"
      });
    }
  };

  const statItems = [
    {
      title: "Músicas na Biblioteca",
      value: loading ? "..." : stats.songsCount.toString(),
      icon: Music,
      color: "text-primary",
    },
    {
      title: "Shows Criados",
      value: loading ? "..." : stats.showsCount.toString(),
      icon: ListMusic,
      color: "text-accent",
    },
    {
      title: "Shows Este Mês",
      value: loading ? "..." : stats.monthlyShows.toString(),
      icon: Calendar,
      color: "text-secondary-foreground",
    },
    {
      title: "Pedidos Recebidos",
      value: loading ? "..." : stats.totalRequests.toString(),
      icon: TrendingUp,
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div 
        className="relative rounded-xl overflow-hidden h-64 bg-gradient-card shadow-card"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${heroMusic})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white">
              Bem-vindo ao Tocafy
            </h2>
            <p className="text-xl text-white/80">
              Gerencie sua música, organize seus shows
            </p>
            <Dialog open={isAddMusicOpen} onOpenChange={setIsAddMusicOpen}>
              <DialogTrigger asChild>
                <Button variant="musical" size="lg" className="animate-pulse-glow hover-lift">
                  <Plus className="mr-2 h-5 w-5" />
                  Adicionar Música
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Música</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Título
                    </Label>
                    <Input
                      id="title"
                      value={newSong.title}
                      onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                      className="col-span-3"
                      placeholder="Nome da música"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="artist" className="text-right">
                      Artista
                    </Label>
                    <Input
                      id="artist"
                      value={newSong.artist}
                      onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                      className="col-span-3"
                      placeholder="Nome do artista"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="key" className="text-right">
                      Tom
                    </Label>
                    <Input
                      id="key"
                      value={newSong.key}
                      onChange={(e) => setNewSong({ ...newSong, key: e.target.value })}
                      className="col-span-3"
                      placeholder="Ex: Am, C, G"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddMusicOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddMusic} disabled={!newSong.title || !newSong.artist}>
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              Músicas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSongs.length > 0 ? (
              recentSongs.map((song, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm font-mono">
                    {song.key}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma música na biblioteca</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListMusic className="h-5 w-5 text-accent" />
              Próximos Shows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum show agendado</p>
              <Button variant="outline" className="mt-3">
                Agendar Show
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};