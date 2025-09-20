import { useState, useRef, useEffect } from 'react';
import { Search, Music, Plus, ExternalLink, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeezer, DeezerTrack } from '@/hooks/use-deezer';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeezerSearchProps {
  placeholder?: string;
  showHeader?: boolean;
  onTrackSelect?: (track: DeezerTrack) => void;
}

export const DeezerSearch = ({ 
  placeholder = "Buscar músicas no Deezer...",
  showHeader = true,
  onTrackSelect 
}: DeezerSearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { loading, results, searchTracks, clearResults } = useDeezer();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const searchRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.trim()) {
      setIsOpen(true);
      timeoutRef.current = setTimeout(() => {
        searchTracks(value);
      }, 300);
    } else {
      setIsOpen(false);
      clearResults();
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAddToLibrary = async (track: DeezerTrack) => {
    if (!user || !profile) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar músicas à sua biblioteca.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('songs')
        .insert({
          title: track.title,
          artist: track.artist.name,
          key: '', // User can edit this later
          genre: null,
          artist_id: profile.id,
          deezer_id: track.id,
          preview_url: track.preview,
          cover_url: track.album.cover_medium
        });

      if (error) throw error;

      toast({
        title: "Música adicionada!",
        description: `${track.title} foi adicionada à sua biblioteca.`,
      });

      setIsOpen(false);
      setQuery('');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar música à biblioteca.",
        variant: "destructive"
      });
    }
  };

  const handleTrackClick = (track: DeezerTrack) => {
    if (onTrackSelect) {
      onTrackSelect(track);
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Buscar no Deezer</h3>
          <p className="text-muted-foreground text-sm">
            Encontre e adicione músicas do catálogo do Deezer
          </p>
        </div>
      )}

      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-secondary/50 border-border"
            onFocus={() => query && setIsOpen(true)}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isOpen && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto bg-card border-border shadow-glow">
            <CardContent className="p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
                      onClick={() => handleTrackClick(track)}
                    >
                      <img
                        src={track.album.cover_medium}
                        alt={`${track.album.title} cover`}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{track.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {track.artist.name} • {track.album.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {formatDuration(track.duration)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {track.preview && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(track.preview, '_blank');
                            }}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToLibrary(track);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://www.deezer.com/track/${track.id}`, '_blank');
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : query && !loading ? (
                <div className="text-center py-8">
                  <Music className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma música encontrada para "{query}"
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};