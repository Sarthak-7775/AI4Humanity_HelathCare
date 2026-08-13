"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AppointmentBookRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const doctor = searchParams.get('doctor');
    const target = doctor ? `/appointments?doctor=${encodeURIComponent(doctor)}` : '/appointments';
    router.replace(target);
  }, [router, searchParams]);

  return null;
}
