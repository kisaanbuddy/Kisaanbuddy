'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { OFFICIAL_WHATSAPP_NUMBER } from '@/components/announcement/AnnouncementPopup';

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppFloatingButton({
  phoneNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ||
    OFFICIAL_WHATSAPP_NUMBER,
  defaultMessage,
}: WhatsAppFloatingButtonProps) {
  const pathname = usePathname();
  if (pathname === '/chatbot' || pathname?.startsWith('/chatbot/')) {
    return null;
  }
  // Clean phone number for click-to-chat URL: digits only, no + or spaces
  const cleanNumber = phoneNumber.replace(/\D/g, '') || OFFICIAL_WHATSAPP_NUMBER;
  const trimmedMessage = defaultMessage?.trim();
  const waUrl = trimmedMessage
    ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(trimmedMessage)}`
    : `https://wa.me/${cleanNumber}`;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 group">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with KisaanBuddy on WhatsApp"
        className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        {/* WhatsApp Official SVG Icon */}
        <svg
          className="w-6 h-6 fill-current flex-shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.03C9.36 7.03 9.08 7.09 8.84 7.35C8.6 7.61 7.92 8.25 7.92 9.54C7.92 10.83 8.86 12.07 9 12.25C9.13 12.43 10.87 15.12 13.53 16.27C14.16 16.54 14.66 16.71 15.04 16.83C15.68 17.03 16.26 17 16.72 16.93C17.24 16.85 18.31 16.28 18.54 15.65C18.76 15.02 18.76 14.48 18.7 14.37C18.63 14.25 18.46 14.19 18.2 14.06C17.94 13.93 16.67 13.3 16.44 13.22C16.2 13.13 16.03 13.09 15.86 13.35C15.69 13.61 15.2 14.19 15.05 14.37C14.9 14.54 14.75 14.56 14.49 14.43C14.23 14.3 13.39 14.02 12.4 13.14C11.63 12.45 11.11 11.6 10.96 11.34C10.81 11.08 10.94 10.94 11.08 10.81C11.2 10.69 11.34 10.51 11.47 10.36C11.6 10.21 11.64 10.1 11.73 9.93C11.82 9.75 11.77 9.6 11.71 9.47C11.64 9.34 11.14 8.12 10.93 7.62C10.73 7.13 10.52 7.2 10.36 7.19C10.21 7.18 10.04 7.18 9.87 7.18L9.53 7.03Z" />
        </svg>
        <span className="font-semibold text-sm tracking-wide hidden sm:inline">
          WhatsApp Help
        </span>
      </a>
    </div>
  );
}
