import { FileText, Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="w-full py-6 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-primary">
              <FileText className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-accent-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Solicitud factura de ticket
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Idesa
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
