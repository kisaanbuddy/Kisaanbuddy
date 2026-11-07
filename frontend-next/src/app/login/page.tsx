import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Farmer Login & Portal Access | KisaanBuddy',
  description: 'Secure mobile OTP and email verification portal for Indian farmers.',
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: true,
      noimageindex: true,
    },
  },
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/login',
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
