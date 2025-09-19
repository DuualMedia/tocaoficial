import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, TrendingUp, Music, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShowReport {
  id: string;
  name: string;
  date: Date;
  totalRequests: number;
  playedSongs: number;
  rejectedSongs: number;
  totalTips: number;
  averageTip: number;
  duration: string;
  status: "completed" | "cancelled";
}

export const Reports = () => {
  const { toast } = useToast();
  const [reports] = useState<ShowReport[]>([
    {
      id: "1",
      name: "Acústico no Bar",
      date: new Date(),
      totalRequests: 45,
      playedSongs: 28,
      rejectedSongs: 17,
      totalTips: 150.00,
      averageTip: 5.36,
      duration: "3h 20min",
      status: "completed"
    },
    {
      id: "2",
      name: "Show da Tarde",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      totalRequests: 23,
      playedSongs: 18,
      rejectedSongs: 5,
      totalTips: 89.50,
      averageTip: 3.89,
      duration: "2h 45min",
      status: "completed"
    }
  ]);

  const exportReport = (report: ShowReport) => {
    const data = {
      show: report.name,
      date: report.date.toLocaleDateString('pt-BR'),
      summary: {
        totalRequests: report.totalRequests,
        playedSongs: report.playedSongs,
        rejectedSongs: report.rejectedSongs,
        acceptanceRate: `${((report.playedSongs / report.totalRequests) * 100).toFixed(1)}%`
      },
      financial: {
        totalTips: `R$ ${report.totalTips.toFixed(2)}`,
        averageTip: `R$ ${report.averageTip.toFixed(2)}`
      },
      duration: report.duration
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${report.name.toLowerCase().replace(/\s+/g, '-')}-${report.date.toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório exportado!",
      description: "O arquivo foi baixado com sucesso."
    });
  };

  const exportAllReports = () => {
    const allData = {
      exportDate: new Date().toISOString(),
      totalShows: reports.length,
      summary: {
        totalRequests: reports.reduce((sum, r) => sum + r.totalRequests, 0),
        totalPlayed: reports.reduce((sum, r) => sum + r.playedSongs, 0),
        totalTips: reports.reduce((sum, r) => sum + r.totalTips, 0),
        averageAcceptanceRate: `${(reports.reduce((sum, r) => sum + (r.playedSongs / r.totalRequests), 0) / reports.length * 100).toFixed(1)}%`
      },
      shows: reports
    };

    const jsonStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-completo-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório completo exportado!",
      description: "Todos os dados foram baixados com sucesso."
    });
  };

  const getTotalStats = () => {
    const totalRequests = reports.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalPlayed = reports.reduce((sum, r) => sum + r.playedSongs, 0);
    const totalTips = reports.reduce((sum, r) => sum + r.totalTips, 0);
    
    return {
      totalRequests,
      totalPlayed,
      totalTips,
      acceptanceRate: totalRequests > 0 ? (totalPlayed / totalRequests) * 100 : 0
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Relatórios & Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe o desempenho dos seus shows e export dados
          </p>
        </div>
        
        <Button 
          onClick={exportAllReports}
          className="bg-gradient-primary hover:opacity-90 shadow-button"
          disabled={reports.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Tudo
        </Button>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-accent/20 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
                <p className="text-xs text-muted-foreground">Total de Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-accent/20 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Music className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalPlayed}</p>
                <p className="text-xs text-muted-foreground">Músicas Tocadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-accent/20 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <div>
                <p className="text-2xl font-bold">{stats.acceptanceRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Aceitação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-accent/20 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold">R$ {stats.totalTips.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Total em Gorjetas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Relatórios */}
      <Card className="bg-gradient-card border-accent/20">
        <CardHeader>
          <CardTitle>Histórico de Shows</CardTitle>
          <CardDescription>
            Relatórios detalhados de cada apresentação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.map((report, index) => (
            <div key={report.id} className={`fade-in`} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20 hover-lift">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{report.name}</h3>
                    <Badge 
                      variant={report.status === "completed" ? "default" : "destructive"}
                      className={report.status === "completed" ? "bg-green-500" : ""}
                    >
                      {report.status === "completed" ? "Concluído" : "Cancelado"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">{report.date.toLocaleDateString('pt-BR')}</p>
                      <p>Data do Show</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{report.totalRequests}</p>
                      <p>Pedidos Recebidos</p>
                    </div>
                    <div>
                      <p className="font-medium text-green-400">{report.playedSongs}</p>
                      <p>Tocadas</p>
                    </div>
                    <div>
                      <p className="font-medium text-red-400">{report.rejectedSongs}</p>
                      <p>Rejeitadas</p>
                    </div>
                    <div>
                      <p className="font-medium text-accent">R$ {report.totalTips.toFixed(2)}</p>
                      <p>Gorjetas</p>
                    </div>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => exportReport(report)}
                  className="ml-4"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
              </div>
              
              {index < reports.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}

          {reports.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum relatório disponível</h3>
              <p className="text-muted-foreground">
                Complete alguns shows para ver os relatórios aqui
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};