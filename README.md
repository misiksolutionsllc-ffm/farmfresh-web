# FarmFresh Hub — Next.js PWA

Florida's premier decentralized food network. A Progressive Web Application built with Next.js, Tailwind CSS, and Zustand.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + custom design system
- **State**: Zustand + localStorage persistence
- **PWA**: next-pwa (service worker, offline support, installable)
- **Icons**: Lucide React
- **Animations**: Framer Motion + CSS animations
- **Deployment**: Vercel

## Getting Started

```bash
# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select the repository → Deploy
4. Done! Your PWA is live.

Or use the Vercel CLI:
```bash
npx vercel
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with PWA meta
│   └── page.tsx            # Role-based routing
├── components/
│   ├── role-selection.tsx   # Landing page
│   ├── ui/
│   │   ├── app-shell.tsx   # Sidebar + topbar + bottom nav
│   │   └── toast.tsx       # Toast notifications
│   ├── customer/
│   │   └── customer-app.tsx # Shop, cart, orders, profile
│   ├── driver/
│   │   └── driver-app.tsx   # Dashboard, deliveries, earnings
│   ├── merchant/
│   │   └── merchant-app.tsx # Orders, inventory, analytics
│   └── admin/
│       └── admin-app.tsx    # God Mode: overview, users, settings
├── lib/
│   ├── store.ts            # Full business logic (ported from RN)
│   ├── app-store.ts        # Zustand wrapper
│   └── utils.ts            # Helpers
└── styles/
    └── globals.css         # Tailwind + custom classes
```

## Features

### Consumer Portal
- Product browsing with categories and search
- Shopping cart with quantity management
- Order placement and tracking
- Favorites, loyalty points, referral credits

### Driver Portal
- Online/offline toggle
- Available deliveries pool
- Active delivery tracking
- Earnings dashboard and cash out

### Merchant Portal
- Order queue with accept/mark ready flow
- Full inventory CRUD
- Sales analytics
- Review management

### Admin (God Mode)
- Platform-wide overview & metrics
- User management (ban/unban)
- Fee & settings controls
- Database viewer & nuke option

## PWA Features

- Installable on iOS, Android, Desktop
- Offline-capable (service worker)
- App-like navigation (standalone mode)
- Responsive: mobile-first with desktop sidebar

## Original Project

Ported from the Expo/React Native FarmFresh app. All 1900+ lines of business logic preserved in `src/lib/store.ts`.
