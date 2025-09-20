import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface DeezerTrack {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
  album: {
    id: string;
    title: string;
    cover_medium: string;
  };
  duration: number;
  preview: string;
}

export interface DeezerSearchResponse {
  data: DeezerTrack[];
  total: number;
}

const DEEZER_API_BASE = 'https://api.deezer.com';

export const useDeezer = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DeezerTrack[]>([]);
  const { toast } = useToast();

  const searchTracks = useCallback(async (query: string, limit = 10) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Erro na busca');
      }
      
      const data: DeezerSearchResponse = await response.json();
      setResults(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar músicas:', error);
      toast({
        title: "Erro na pesquisa",
        description: "Não foi possível buscar músicas. Tente novamente.",
        variant: "destructive"
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const searchArtists = useCallback(async (query: string, limit = 10) => {
    if (!query.trim()) return [];

    try {
      const response = await fetch(
        `${DEEZER_API_BASE}/search/artist?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Erro na busca de artistas');
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar artistas:', error);
      toast({
        title: "Erro na pesquisa",
        description: "Não foi possível buscar artistas. Tente novamente.",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  const getTrackDetails = useCallback(async (trackId: string) => {
    try {
      const response = await fetch(`${DEEZER_API_BASE}/track/${trackId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao obter detalhes da música');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao obter detalhes da música:', error);
      toast({
        title: "Erro",
        description: "Não foi possível obter detalhes da música.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    loading,
    results,
    searchTracks,
    searchArtists,
    getTrackDetails,
    clearResults
  };
};