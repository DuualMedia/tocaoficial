import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Settings,
  Monitor,
  Moon,
  Sun,
  Scroll,
  Music
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  lyrics: string;
  chords: string;
}

interface Request {
  id: string;
  songTitle: string;
  requester: string;
  timestamp: Date;
  status: "pending" | "accepted" | "playing" | "completed";
  notes?: string;
}

export default function Stage() {
  const { showId } = useParams();
  const { toast } = useToast();
  
  // State Management
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [requests, setRequests] = useState<Request[]>([
    {
      id: "1",
      songTitle: "Wonderwall",
      requester: "João",
      timestamp: new Date(),
      status: "accepted"
    },
    {
      id: "2", 
      songTitle: "Hotel California",
      requester: "Maria",
      timestamp: new Date(),
      status: "pending"
    }
  ]);
  
  // Stage Settings
  const [fontSize, setFontSize] = useState([18]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState([30]);
  const [currentKey, setCurrentKey] = useState("G");
  const [capoPosition, setCapoPosition] = useState([0]);
  
  // UI State
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRequestQueue, setShowRequestQueue] = useState(true);
  
  const lyricsRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout>();

  // Mock song data
  const mockSong: Song = {
    id: "1",
    title: "Wonderwall",
    artist: "Oasis",
    key: "G",
    lyrics: `[Intro]
Em7  G  D  C  (2x)

[Verse 1]
Em7                G
Today is gonna be the day
      D                    C
That they're gonna throw it back to you
Em7               G
By now you should've somehow
D                     C
Realized what you gotta do
Em7               G                D
I don't believe that anybody feels
    C          Em7    G  D  C
The way I do about you now

[Verse 2]
Em7                G
Backbeat the word was on the street
D                C
That fire in your heart is out
Em7               G
I'm sure you've heard it all before
D                 C
But you never really had a doubt
Em7               G                D
I don't believe that anybody feels
    C          Em7    G  D  C
The way I do about you now

[Pre-Chorus]
    C                D
And all the roads we have to walk
    Em7              G
Are winding
    C                D
And all the lights that lead us there
    Em7
Are blinding
C                D
There are many things that I
Em7              G               C         D    G
Would like to say to you but I don't know how

[Chorus]
    C       Em7     G
Because maybe
      Em7           C       Em7     G
You're gonna be the one that saves me
    C       Em7     G  Em7  C  Em7  G
And after all
      Em7           C       Em7     G
You're my wonderwall`,
    chords: "Em7, G, D, C"
  };

  useEffect(() => {
    setCurrentSong(mockSong);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoScroll && lyricsRef.current) {
      scrollIntervalRef.current = setInterval(() => {
        lyricsRef.current?.scrollBy({
          top: 1,
          behavior: 'smooth'
        });
      }, scrollSpeed[0]);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isAutoScroll, scrollSpeed]);

  const handleRequestAction = (requestId: string, action: "accept" | "skip" | "play") => {
    setRequests(requests.map(req => {
      if (req.id === requestId) {
        switch (action) {
          case "accept":
            return { ...req, status: "accepted" };
          case "play":
            setCurrentSong(mockSong); // In real app, fetch song data
            return { ...req, status: "playing" };
          case "skip":
            return { ...req, status: "completed" };
        }
      }
      return req;
    }));

    const actionMessages = {
      accept: "Pedido aceito!",
      play: "Tocando agora",
      skip: "Pedido pulado"
    };

    toast({
      title: actionMessages[action],
      description: action === "play" ? "A música está sendo exibida no palco" : undefined
    });
  };

  const transposeKey = (direction: "up" | "down") => {
    const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const currentIndex = keys.indexOf(currentKey);
    let newIndex;
    
    if (direction === "up") {
      newIndex = (currentIndex + 1) % keys.length;
    } else {
      newIndex = (currentIndex - 1 + keys.length) % keys.length;
    }
    
    setCurrentKey(keys[newIndex]);
    toast({
      title: `Tom alterado para ${keys[newIndex]}`,
      description: "Cifras transpostas automaticamente"
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-background'} transition-colors duration-300`}>
      {/* Header Controls */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-accent/20 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-gradient-primary text-white">
              Show #{showId}
            </Badge>
            {currentSong && (
              <div>
                <h2 className="font-semibold">{currentSong.title}</h2>
                <p className="text-sm text-muted-foreground">{currentSong.artist}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Playback Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            {/* Font Size Controls */}
            <Button variant="outline" size="sm" onClick={() => setFontSize([Math.max(12, fontSize[0] - 2)])}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm px-2">{fontSize[0]}px</span>
            <Button variant="outline" size="sm" onClick={() => setFontSize([Math.min(32, fontSize[0] + 2)])}>
              <ZoomIn className="w-4 h-4" />
            </Button>

            {/* Key Controls */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={() => transposeKey("down")}>
                -
              </Button>
              <span className="px-2 text-sm font-mono">{currentKey}</span>
              <Button variant="ghost" size="sm" onClick={() => transposeKey("up")}>
                +
              </Button>
            </div>

            {/* Capo Position */}
            {capoPosition[0] > 0 && (
              <Badge variant="outline">
                Capo: {capoPosition[0]}ª casa
              </Badge>
            )}

            {/* Toggle Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className={isAutoScroll ? "bg-primary text-primary-foreground" : ""}
            >
              <Scroll className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRequestQueue(!showRequestQueue)}
            >
              <Music className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Settings Panel */}
        {showSettings && (
          <Card className="mt-4 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Velocidade do Auto-scroll</label>
                  <Slider
                    value={scrollSpeed}
                    onValueChange={setScrollSpeed}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">{scrollSpeed[0]}ms</span>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Posição do Capo</label>
                  <Slider
                    value={capoPosition}
                    onValueChange={setCapoPosition}
                    max={12}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">{capoPosition[0]}ª casa</span>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tamanho da Fonte</label>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    max={32}
                    min={12}
                    step={2}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">{fontSize[0]}px</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex">
        {/* Request Queue Sidebar */}
        {showRequestQueue && (
          <div className="w-80 border-r border-accent/20 bg-card/50 backdrop-blur-sm">
            <div className="p-4 border-b border-accent/20">
              <h3 className="font-semibold">Fila de Pedidos</h3>
              <p className="text-sm text-muted-foreground">{requests.length} pedidos</p>
            </div>
            
            <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {requests.map((request) => (
                <Card key={request.id} className="bg-gradient-card border-accent/20">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{request.songTitle}</h4>
                        <p className="text-xs text-muted-foreground">
                          por {request.requester}
                        </p>
                      </div>
                      <Badge 
                        variant={request.status === "playing" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {request.status === "pending" && "Pendente"}
                        {request.status === "accepted" && "Aceito"}
                        {request.status === "playing" && "Tocando"}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-1">
                      {request.status === "pending" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleRequestAction(request.id, "accept")}
                          className="flex-1 text-xs"
                        >
                          Aceitar
                        </Button>
                      )}
                      
                      {request.status === "accepted" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleRequestAction(request.id, "play")}
                          className="flex-1 text-xs bg-green-500 hover:bg-green-600"
                        >
                          Tocar
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRequestAction(request.id, "skip")}
                        className="flex-1 text-xs"
                      >
                        Pular
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Stage Content */}
        <div className="flex-1 p-6">
          {currentSong ? (
            <div className="max-w-4xl mx-auto">
              <div 
                ref={lyricsRef}
                className="whitespace-pre-line font-mono leading-relaxed max-h-[calc(100vh-200px)] overflow-y-auto"
                style={{ fontSize: `${fontSize[0]}px` }}
              >
                {currentSong.lyrics}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Nenhuma música selecionada</h2>
              <p className="text-muted-foreground">
                Selecione uma música da fila de pedidos para começar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}