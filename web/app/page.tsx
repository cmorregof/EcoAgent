import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-card p-12 max-w-2xl text-center relative overflow-hidden border-accent/20">
        {/* Subtle accent glow inside the card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="text-7xl mb-6 drop-shadow-2xl">🌍</div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text tracking-tighter">
          EcoAgent
        </h1>
        
        <p className="text-xl text-obsidian-on-surface-var mb-10 leading-relaxed font-body">
          Plataforma avanzada de monitoreo y análisis estocástico para la gestión del riesgo climático. 
          Monitoreo en tiempo real de deslizamientos con precisión científica.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            href="/register" 
            className="btn-primary flex items-center justify-center text-lg px-8 py-4"
          >
            Comenzar Análisis
          </Link>
          <Link 
            href="/login" 
            className="btn-secondary flex items-center justify-center text-lg px-8 py-4"
          >
            Portal de Acceso
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-outline-var/50 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 text-xs font-mono text-accent/80 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Live Sensing
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent/80 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Risk Simulation
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent/80 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Voice AI Alerting
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-obsidian-on-surface-var/60 text-sm font-body tracking-wide">
        Obsidian Observatory System — Optimized for Manizales Region
      </div>
    </div>
  );
}
