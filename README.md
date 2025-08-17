# SaxsSpot Frontend

A modern React application for SAXS (Small-Angle X-ray Scattering) data analysis and visualization.

## 🚀 Features

- **Nanosystem Management**: Create, view, and manage nanosystem experiments
- **Real-time Calculations**: Run and monitor SAXS calculations
- **Data Visualization**: Interactive charts and plots for analysis results
- **Job Management**: Monitor calculation jobs and their status
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router 7
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Heroicons
- **UI Components**: Headless UI

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Layout)
│   └── ui/            # Generic UI components
├── features/           # Feature-based modules
│   ├── calculation/   # Calculation-related functionality
│   ├── jobs/         # Job management
│   ├── nanosystems/  # Nanosystem management
│   └── common/       # Shared feature code
├── pages/             # Page components
├── lib/              # Utilities and configurations
├── types/            # TypeScript type definitions
└── assets/           # Static assets
```

## 🏗️ Setup & Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   VITE_NANOSYSTEM_API_URL=http://localhost:5062/api
   VITE_CALCULATION_API_URL=http://localhost:5067/api
   VITE_JOB_API_URL=http://localhost:8080
   VITE_JOB_AUTH_TOKEN=your_jwt_token_here
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts

## 🔧 Configuration

### API Endpoints

The application connects to three main APIs:

- **Nanosystem API**: Manages nanosystem data and series
- **Calculation API**: Handles SAXS calculations and plotting
- **Job API**: Monitors calculation jobs and status

### Path Aliases

The project uses path aliases for cleaner imports:

- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/features/*` → `src/features/*`
- `@/pages/*` → `src/pages/*`
- `@/lib/*` → `src/lib/*`

## 🎨 Styling

The project uses Tailwind CSS with a custom configuration:

- Modern gradient backgrounds
- Scientific theme colors
- Responsive design patterns
- Custom animations and transitions

## 📊 State Management

- **TanStack Query**: Server state management with caching
- **React Hook Form**: Form state and validation
- **React Router**: Navigation state

## 🔍 Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Configured with React and TypeScript rules
- **Path mapping**: Clean import paths with aliases

## 🚀 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory

3. Deploy to your preferred hosting platform

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Use the provided TypeScript interfaces and types
3. Ensure all components are properly typed
4. Run linting before committing: `npm run lint:fix`

## 📝 License

[Your License Here]
