# FiveCount: Athlete Discovery Platform

**Bottom-up athlete-driven recruiting for men's gymnastics, ad-supported by gymnastics brands.**

## Project Purpose & Problem Statement

**Men's gymnastics recruiting** faces three unique problems:

### 1. Athlete Problem
No centralized place to build a recruiting profile. Scores scattered across 5 platforms (ScoreCat, MyUSAGym, MeetScoresOnline, Instagram, email). Coaches can't easily discover talent.

### 2. Coach Problem
Hard to discover gymnasts who don't compete at nationals. Coaches use outdated methods: email, phone calls, meet attendance, Instagram.

### 3. Gymnastics Brand Problem
Sponsors want to reach gymnastics community but current sponsorships are seasonal and scattered. Meet sponsorships = limited reach and poor ROI.

## Our Solution

**Build a FREE athlete profile platform (ad-supported by gymnastics brands)**

- **Athletes:** Track scores, build public profiles, share with coaches. No paywall.
- **Coaches:** Discover athletes organically. Free search, optional inquiry features.
- **Sponsors:** Gymnastics brands (GK Elite, Turn, AAI) sponsor for year-round visibility to 1000+ gymnasts.

## Why This Works

- **Free eliminates friction:** ScoreCat users hate $5/month paywall (complaint #1: "Why pay when info is free elsewhere?")
- **Coaches follow athletes:** Network effects work bottom-up. As athletes join → coaches discover → more athletes join → repeat
- **Sponsors already budgeted:** Gymnastics brands spend $100k+/year on sponsorships. We offer better ROI than seasonal meet sponsorships
- **Defensible position:** Once athletes are on platform, coaches must follow. Creates network lock-in

## Business Model: Ad-Supported

| User | Cost | Value |
|------|------|-------|
| Athletes | FREE | Build profile, track scores, share with coaches |
| Coaches | FREE | Find athletes, search profiles, inquire about talent |
| Sponsors | $10-15k/month | Year-round visibility to 1000+ gymnasts, featured placement |

**Year 1 Revenue Target:** $240k-360k (2-3 active sponsors)

## Target Sponsors

- **GK Elite** (apparel, biggest brand)
- **Turn** (equipment, supplements)
- **AAI** (apparel)
- **Mystique Activewear** (apparel)
- **Caboodles** (storage solutions)

## Getting Started

### Frontend Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Backend Development

The backend is a Spring Boot API in the separate `Recruitment-App` repository. See CLAUDE.md for API documentation.

### Environment Setup

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Features Implemented

- ✅ User authentication (Supabase)
- ✅ Athlete profile creation
- ✅ Dashboard layout with protected routes
- ✅ API client setup
- 🚀 Sponsor management (in progress)
- 🚀 Athlete search/discovery (coming soon)
- 🚀 Coach inquiry system (coming soon)

## Sponsor Management (Admin Only)

### Creating a Sponsor

```bash
curl -X POST http://localhost:8080/api/sponsors \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GK Elite",
    "logoUrl": "https://example.com/gkelite-logo.png",
    "sponsorUrl": "https://gkelite.com",
    "category": "apparel",
    "isActive": true
  }'
```

### Getting Active Sponsors

```bash
curl http://localhost:8080/api/sponsors/active
```

### Getting Random Sponsor (For Frontend Display)

```bash
curl http://localhost:8080/api/sponsors/random
```

## Project Structure

- `/src/app` - Next.js pages and layouts
- `/src/components` - Reusable React components
- `/src/lib` - Utilities (API client, Supabase)
- `/src/contexts` - React context providers (Auth)
- `/src/hooks` - Custom React hooks

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Spring Boot (separate repository)
- **Auth:** Supabase
- **Database:** PostgreSQL
- **ORM:** JPA/Hibernate
- **UI Components:** Custom React components with Tailwind

## Deployment

Frontend deploys to Vercel. Backend deploys to AWS/Railway.

## Questions?

For documentation about API endpoints, see CLAUDE.md.
For issues or feature requests, open an issue on GitHub.
