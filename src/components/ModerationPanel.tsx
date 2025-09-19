import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, Clock, Users, Ban, Eye, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FlaggedRequest {
  id: string;
  song: string;
  artist: string;
  message: string;
  requester: string;
  timestamp: Date;
  reason: "profanity" | "spam" | "inappropriate" | "manual";
  status: "pending" | "approved" | "rejected";
}

interface ModerationSettings {
  profanityFilter: boolean;
  spamPrevention: boolean;
  requestLimit: number;
  timeWindow: number; // minutes
  requireModeration: boolean;
  blockedWords: string[];
}

export const ModerationPanel = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<ModerationSettings>({
    profanityFilter: true,
    spamPrevention: true,
    requestLimit: 3,
    timeWindow: 15,
    requireModeration: false,
    blockedWords: ["palavra1", "palavra2", "spam"]
  });

  const [newBlockedWord, setNewBlockedWord] = useState("");

  const [flaggedRequests] = useState<FlaggedRequest[]>([
    {
      id: "1",
      song: "Música Problemática",
      artist: "Artista X",
      message: "Mensagem com conteúdo inadequado aqui...",
      requester: "Usuario123",
      timestamp: new Date(),
      reason: "profanity",
      status: "pending"
    },
    {
      id: "2",
      song: "Outra Música",
      artist: "Artista Y", 
      message: "Spam spam spam spam...",
      requester: "SpamUser",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      reason: "spam",
      status: "pending"
    }
  ]);

  const updateSettings = (key: keyof ModerationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Configurações atualizadas",
      description: "As alterações foram salvas com sucesso."
    });
  };

  const addBlockedWord = () => {
    if (newBlockedWord.trim() && !settings.blockedWords.includes(newBlockedWord.trim())) {
      updateSettings("blockedWords", [...settings.blockedWords, newBlockedWord.trim()]);
      setNewBlockedWord("");
    }
  };

  const removeBlockedWord = (word: string) => {
    updateSettings("blockedWords", settings.blockedWords.filter(w => w !== word));
  };

  const handleRequest = (requestId: string, action: "approved" | "rejected") => {
    // Em produção, isso atualizaria o backend
    toast({
      title: `Pedido ${action === "approved" ? "aprovado" : "rejeitado"}`,
      description: "A decisão foi aplicada com sucesso."
    });
  };

  const getReasonText = (reason: FlaggedRequest["reason"]) => {
    switch (reason) {
      case "profanity": return "Linguagem Inadequada";
      case "spam": return "Spam Detectado";
      case "inappropriate": return "Conteúdo Inapropriado";
      case "manual": return "Reportado Manualmente";
      default: return "Outro";
    }
  };

  const getReasonColor = (reason: FlaggedRequest["reason"]) => {
    switch (reason) {
      case "profanity": return "bg-red-500";
      case "spam": return "bg-orange-500";
      case "inappropriate": return "bg-yellow-500";
      case "manual": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const pendingRequests = flaggedRequests.filter(r => r.status === "pending");

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Painel de Moderação
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie a moderação de conteúdo e configure filtros automáticos
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-500" />
          <Badge variant="secondary">
            {pendingRequests.length} Pendentes
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue">Fila de Moderação</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="blocked">Palavras Bloqueadas</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          <Card className="bg-gradient-card border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Pedidos Sinalizados
              </CardTitle>
              <CardDescription>
                Revise os pedidos que foram automaticamente sinalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum pedido pendente</h3>
                  <p className="text-muted-foreground">
                    Todos os pedidos foram processados ou aprovados automaticamente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request, index) => (
                    <div key={request.id} className={`fade-in`} style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="border border-border rounded-lg p-4 bg-muted/20 hover-lift">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{request.song}</h3>
                              <Badge className={`${getReasonColor(request.reason)} text-white`}>
                                {getReasonText(request.reason)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              por {request.artist} • Solicitado por: {request.requester}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {request.timestamp.toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        {request.message && (
                          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
                            <p className="text-sm">
                              <strong>Mensagem:</strong> "{request.message}"
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRequest(request.id, "approved")}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequest(request.id, "rejected")}
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                      {index < pendingRequests.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gradient-card border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações de Moderação
              </CardTitle>
              <CardDescription>
                Configure os filtros automáticos e políticas de moderação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Filtro de Palavrões</Label>
                  <p className="text-sm text-muted-foreground">
                    Detecta e bloqueia automaticamente linguagem inadequada
                  </p>
                </div>
                <Switch
                  checked={settings.profanityFilter}
                  onCheckedChange={(checked) => updateSettings("profanityFilter", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Prevenção de Spam</Label>
                  <p className="text-sm text-muted-foreground">
                    Limita pedidos repetidos do mesmo usuário
                  </p>
                </div>
                <Switch
                  checked={settings.spamPrevention}
                  onCheckedChange={(checked) => updateSettings("spamPrevention", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Moderação Manual</Label>
                  <p className="text-sm text-muted-foreground">
                    Todos os pedidos requerem aprovação manual
                  </p>
                </div>
                <Switch
                  checked={settings.requireModeration}
                  onCheckedChange={(checked) => updateSettings("requireModeration", checked)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestLimit">Limite de Pedidos</Label>
                  <Input
                    id="requestLimit"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.requestLimit}
                    onChange={(e) => updateSettings("requestLimit", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Máximo de pedidos por usuário
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeWindow">Janela de Tempo (min)</Label>
                  <Input
                    id="timeWindow"
                    type="number"
                    min="5"
                    max="60"
                    value={settings.timeWindow}
                    onChange={(e) => updateSettings("timeWindow", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Período para contabilizar pedidos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-6">
          <Card className="bg-gradient-card border-accent/20">
            <CardHeader>
              <CardTitle>Palavras Bloqueadas</CardTitle>
              <CardDescription>
                Gerencie a lista de palavras que são automaticamente filtradas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite uma palavra para bloquear..."
                  value={newBlockedWord}
                  onChange={(e) => setNewBlockedWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBlockedWord()}
                  className="flex-1"
                />
                <Button onClick={addBlockedWord} disabled={!newBlockedWord.trim()}>
                  Adicionar
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Palavras Bloqueadas Atualmente:</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.blockedWords.map((word) => (
                    <Badge
                      key={word}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeBlockedWord(word)}
                    >
                      {word} ✕
                    </Badge>
                  ))}
                </div>
                {settings.blockedWords.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma palavra bloqueada no momento
                  </p>
                )}
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <h4 className="font-semibold text-orange-500 mb-2">⚠️ Importante</h4>
                <p className="text-sm text-muted-foreground">
                  As palavras bloqueadas são aplicadas tanto ao nome da música quanto à mensagem do pedido. 
                  Use com moderação para não filtrar conteúdo legítimo acidentalmente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};