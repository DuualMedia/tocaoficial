import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, TrendingUp, PiggyBank, CreditCard, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  showName: string;
  amount: number;
  date: Date;
  type: "tip" | "commission";
  status: "pending" | "completed" | "failed";
}

interface MonthlyReport {
  month: string;
  totalEarnings: number;
  totalTips: number;
  totalShows: number;
  averagePerShow: number;
}

export const FinancialDashboard = () => {
  const { toast } = useToast();
  const [pixKey, setPixKey] = useState("usuario@email.com");
  const [isEditingPix, setIsEditingPix] = useState(false);
  
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      showName: "Acústico no Bar",
      amount: 150.00,
      date: new Date(),
      type: "tip",
      status: "completed"
    },
    {
      id: "2", 
      showName: "Show da Tarde",
      amount: 89.50,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: "tip",
      status: "completed"
    },
    {
      id: "3",
      showName: "Rock na Praça",
      amount: 25.00,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      type: "tip",
      status: "pending"
    }
  ]);

  const [monthlyReports] = useState<MonthlyReport[]>([
    {
      month: "Janeiro 2024",
      totalEarnings: 892.50,
      totalTips: 892.50,
      totalShows: 8,
      averagePerShow: 111.56
    },
    {
      month: "Dezembro 2023",
      totalEarnings: 1205.00,
      totalTips: 1205.00,
      totalShows: 12,
      averagePerShow: 100.42
    }
  ]);

  const updatePixKey = () => {
    // Em produção, isso salvaria no backend
    toast({
      title: "Chave PIX atualizada!",
      description: "Suas configurações foram salvas com sucesso."
    });
    setIsEditingPix(false);
  };

  const getCurrentMonthStats = () => {
    const currentMonth = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const now = new Date();
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear();
    });

    const totalEarnings = currentMonth.reduce((sum, t) => sum + t.amount, 0);
    const completedEarnings = currentMonth
      .filter(t => t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingEarnings = currentMonth
      .filter(t => t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalEarnings,
      completedEarnings,
      pendingEarnings,
      transactionCount: currentMonth.length
    };
  };

  const stats = getCurrentMonthStats();

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Dashboard Financeiro
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas gorjetas e acompanhe seus ganhos
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas do Mês Atual */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-card border-accent/20 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">R$ {stats.completedEarnings.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Recebido este Mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-accent/20 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">R$ {stats.pendingEarnings.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Pendente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-accent/20 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">{stats.transactionCount}</p>
                    <p className="text-xs text-muted-foreground">Transações</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-accent/20 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <PiggyBank className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      R$ {stats.transactionCount > 0 ? (stats.totalEarnings / stats.transactionCount).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground">Média por Show</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Relatórios Mensais */}
          <Card className="bg-gradient-card border-accent/20">
            <CardHeader>
              <CardTitle>Histórico Mensal</CardTitle>
              <CardDescription>
                Resumo dos seus ganhos por mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyReports.map((report, index) => (
                  <div key={report.month} className={`fade-in`} style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20 hover-lift">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{report.month}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p className="font-medium text-green-400">R$ {report.totalEarnings.toFixed(2)}</p>
                            <p>Total Ganho</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{report.totalShows}</p>
                            <p>Shows Realizados</p>
                          </div>
                          <div>
                            <p className="font-medium text-accent">R$ {report.averagePerShow.toFixed(2)}</p>
                            <p>Média por Show</p>
                          </div>
                          <div>
                            <p className="font-medium text-primary">R$ {report.totalTips.toFixed(2)}</p>
                            <p>Total em Gorjetas</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < monthlyReports.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-gradient-card border-accent/20">
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Histórico detalhado de todas as suas gorjetas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <div key={transaction.id} className={`fade-in`} style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20 hover-lift">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{transaction.showName}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date.toLocaleDateString('pt-BR')} às {transaction.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge 
                          variant={transaction.status === "completed" ? "default" : 
                                  transaction.status === "pending" ? "secondary" : "destructive"}
                          className={
                            transaction.status === "completed" ? "bg-green-500" :
                            transaction.status === "pending" ? "bg-orange-500" : ""
                          }
                        >
                          {transaction.status === "completed" ? "Recebido" :
                           transaction.status === "pending" ? "Pendente" : "Falhou"}
                        </Badge>
                        
                        <div className="text-right">
                          <p className="font-bold text-green-400">+ R$ {transaction.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Gorjeta</p>
                        </div>
                      </div>
                    </div>
                    {index < transactions.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gradient-card border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações PIX
              </CardTitle>
              <CardDescription>
                Configure sua chave PIX para receber gorjetas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave PIX</Label>
                {isEditingPix ? (
                  <div className="flex space-x-2">
                    <Input
                      id="pixKey"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="Digite sua chave PIX"
                      className="flex-1"
                    />
                    <Button onClick={updatePixKey} className="bg-gradient-primary">
                      Salvar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditingPix(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20">
                    <span className="font-mono">{pixKey}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsEditingPix(true)}
                    >
                      Editar
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">💡 Dica</h4>
                <p className="text-sm text-muted-foreground">
                  Sua chave PIX será usada para gerar QR codes de pagamento durante os shows. 
                  Certifique-se de que está correta para receber suas gorjetas sem problemas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};