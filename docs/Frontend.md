# Frontend Architecture

This document details the frontend implementation of KisaanBuddy.

---

## Technical Stack

The frontend is built as a Single Page Application (SPA) using **Next.js 14 (App Router)** and styled using **TailwindCSS** and **Radix UI** primitives.

---

## Design Systems & UI Layout

1. **Responsive UI:** The layout uses CSS Grid and Flexbox structures to adapt to small-screen mobile devices used by farmers in the field.
2. **PWA Integration:** The app is configured as a Progressive Web App (PWA) with a manifest file to enable homescreen shortcuts and cached local layouts.
3. **Multilingual Shell:** Frontend text resources are externalized into localized JSON files (`lib/locales/`) supporting English, Hindi, and Kannada. Language preferences are saved in `localStorage` to persist across sessions.

---

## Key Components

- `components/assistant/`: Voice assistant floating action widget. Leverages the browser Web Speech API for low-latency voice capture (STT) and text-to-speech (TTS), fallback-redirecting to Server-Sent Event (SSE) streams if browser engines are missing.
- `components/weather/`: Displays weather dashboards with hourly and daily charts utilizing Recharts.
- `components/LocationAutoFill.tsx`: Implements debounced keystroke inputs for searching mandis and weather coordinates.
