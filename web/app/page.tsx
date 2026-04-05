import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <div className="glass-card p-10 max-w-2xl text-center">
        <div className="text-6xl mb-6">🌍</div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 gradient-text tracking-tight">
          Protege el Futuro con EcoAgent
        </h1>
        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
          Plataforma avanzada de análisis estocástico para la predicción del riesgo climático de deslizamientos. 
          Integración en tiempo real con modelos CIR y alertas por voz.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/register" 
            className="btn-primary flex items-center justify-center text-lg shadow-lg hover:shadow-green-500/25"
          >
            Comenzar Prueba
          </Link>
          <Link 
            href="/login" 
            className="flex items-center justify-center text-lg px-8 py-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all font-semibold"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
      
      <div className="mt-12 text-slate-500 text-sm">
        Sistema optimizado para monitoreo en Manizales, Caldas.
      </div>
    </div>
  );
}
