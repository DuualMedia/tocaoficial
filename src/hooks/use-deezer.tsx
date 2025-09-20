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

// JSONP helper function to avoid CORS issues
const jsonpRequest = (url: string, callbackName: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP request timeout'));
    }, 10000);

    const cleanup = () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
      }
      clearTimeout(timeoutId);
    };

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP request failed'));
    };

    script.src = url;
    document.head.appendChild(script);
  });
};

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
      const callbackName = `deezer_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const url = `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}&output=jsonp&callback=${callbackName}`;
      
      const data: DeezerSearchResponse = await jsonpRequest(url, callbackName);
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
      const callbackName = `deezer_artist_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const url = `${DEEZER_API_BASE}/search/artist?q=${encodeURIComponent(query)}&limit=${limit}&output=jsonp&callback=${callbackName}`;
      
      const data = await jsonpRequest(url, callbackName);
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
      const callbackName = `deezer_track_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const url = `${DEEZER_API_BASE}/track/${trackId}?output=jsonp&callback=${callbackName}`;
      
      return await jsonpRequest(url, callbackName);
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