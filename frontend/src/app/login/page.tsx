'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const [ mode, setMode ] = useState<'login' | 'register'>('login');
  const router = useRouter();

  const toggleMode = () => {
   const newMode = mode === 'login' ? 'register' : 'login';
   setMode(newMode);
   
   // URL도 함께 변경
    if (newMode === 'register') {
      router.push('/register');
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AuthForm mode={mode} onToggleMode={toggleMode} />
      </div>
  );
}