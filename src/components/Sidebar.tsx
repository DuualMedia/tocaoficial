import { Home, Music, ListMusic, Settings, Library, FileText, DollarSign, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const sidebarItems = [
  { icon: Home, label: "Dashboard", key: "dashboard" },
  { icon: Library, label: "Biblioteca", key: "library" },
  { icon: Music, label: "Shows", key: "shows" },
  { icon: FileText, label: "Relatórios", key: "reports" },
  { icon: DollarSign, label: "Financeiro", key: "financial" },
  { icon: Shield, label: "Moderação", key: "moderation" },
  { icon: Eye, label: "Acessibilidade", key: "accessibility" },
  { icon: Settings, label: "Configurações", key: "settings" },
];

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-gradient-card backdrop-blur-sm shadow-card">
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.key}
              variant={activeTab === item.key ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 transition-all duration-200 hover-lift ${
                activeTab === item.key 
                  ? "bg-gradient-primary text-primary-foreground shadow-button" 
                  : "hover:bg-secondary/80"
              }`}
              onClick={() => setActiveTab(item.key)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};