import { Music, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/components/UserProfile";
import musicIcon from "@/assets/music-icon.png";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={musicIcon} alt="Tocafy" className="h-8 w-8" />
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Tocafy
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar músicas, artistas..."
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
          <UserProfile />
        </div>
      </div>
    </header>
  );
};