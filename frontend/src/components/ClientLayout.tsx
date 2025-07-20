// frontend/src/components/ClientLayout.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

// 새로고침 시 쿠키 값 검증 딜레이
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // 앱 시작 시 인증 상태 확인
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}