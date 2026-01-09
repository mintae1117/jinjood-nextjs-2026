# 진주떡집 (Jinjood Rice Cake Shop)

1995년부터 이어온 부산 전통 떡집 웹사이트입니다.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Styled Components
- **Database**: Supabase
- **Deployment**: Vercel
- **Animation**: Framer Motion
- **Carousel**: Swiper

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jinjood-nextjs-2026
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Set up Supabase database:
   - Go to your Supabase project
   - Run the SQL from `supabase/schema.sql` in the SQL Editor
   - Create a storage bucket named `images` and make it public
   - Upload images to the appropriate folders

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
jinjood-nextjs-2026/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── menu/              # Menu page
│   ├── gifts/             # Gift sets page
│   ├── reciprocate/       # Reciprocation items page
│   └── contact/           # Contact page
├── src/
│   ├── components/        # React components
│   │   ├── common/        # Shared components (Header, Footer, etc.)
│   │   ├── home/          # Home page components
│   │   └── menu/          # Menu page components
│   ├── data/              # Sample data (for development)
│   ├── lib/               # Utility functions & Supabase client
│   ├── styles/            # Global styles & theme
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
│   ├── images/            # Images
│   └── videos/            # Videos
└── supabase/              # Supabase configuration
    └── schema.sql         # Database schema
```

## Pages

- **Home (`/`)**: Hero banner, featured menu, gift sets, video section, SNS links
- **Menu (`/menu`)**: All menu items with category filtering
- **Gifts (`/gifts`)**: Gift sets and special packages
- **Reciprocate (`/reciprocate`)**: Wedding and ceremony items
- **Contact (`/contact`)**: Store location, contact info, map

## Features

- Responsive design (mobile, tablet, desktop)
- Animated page transitions with Framer Motion
- Image optimization with Next.js Image
- Category filtering on menu pages
- Interactive image carousel
- Google Maps integration
- SNS integration (Instagram, Kakao, Naver)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Contact

- Website: https://jinjood.com
- Phone: 051-621-5108
- Email: jea6922@naver.com
- Address: 부산광역시 수영구 황령대로 481번길 10-3
