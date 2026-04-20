// ---
// 📚 POR QUÉ: Página de registro con consentimiento de datos obligatorio.
//    GDPR y regulaciones colombianas exigen consentimiento explícito antes de procesar
//    datos personales. Sin el checkbox de consentimiento con fecha, el proyecto no
//    podría operar legalmente como SaaS.
// 📁 ARCHIVO: web/app/(auth)/register/page.tsx
// ---

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('Debes aceptar el consentimiento de datos para continuar.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Insert into public.users with consent
      await supabase.from('users').insert({
        id: data.user.id,
        full_name: fullName,
        data_consent: true,
        consent_date: new Date().toISOString(),
      });

      // Create default settings
      await supabase.from('user_settings').insert({
        user_id: data.user.id,
      });

      router.push('/onboarding');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">EcoAgent</h1>
          <p className="text-slate-400">Register for climate risk monitoring</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full"
              placeholder="System Operator"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              placeholder="operator@system.sys"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded">
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded accent-blue-500"
            />
            <label htmlFor="consent" className="text-sm text-slate-300 leading-relaxed">
              I consent to EcoAgent processing my climate data to generate 
              personalized risk alerts.
            </label>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !consent}
            className="btn-primary w-full"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
