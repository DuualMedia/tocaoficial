import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { MusicLibrary } from "@/components/MusicLibrary";
import { ShowManager } from "@/components/ShowManager";
import { Reports } from "@/components/Reports";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { ModerationPanel } from "@/components/ModerationPanel";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "library":
        return <MusicLibrary />;
      case "shows":
        return <ShowManager />;
      case "reports":
        return <Reports />;
      case "financial":
        return <FinancialDashboard />;
      case "moderation":
        return <ModerationPanel />;
      case "accessibility":
        return <AccessibilitySettings />;
      case "settings":
        return <div className="fade-in"><h1 className="text-3xl font-bold">Configurações Gerais</h1><p className="text-muted-foreground mt-2">Em desenvolvimento...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background fade-in">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 ml-64 p-6 mobile-compact">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;