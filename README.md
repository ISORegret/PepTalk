# Health Tracker App

A comprehensive health tracking application for monitoring weight, medication injections, body measurements, and progress photos. Designed for tracking GLP-1 medications, peptides, and hormone therapy.

## Features

- **Weight Tracking** - Log and visualize weight changes over time
- **Injection Logging** - Track medications including Semaglutide, Tirzepatide, testosterone, BPC-157, TB-500, and more
- **Body Measurements** - Monitor waist, hips, chest, arms, thighs, and other measurements
- **Progress Photos** - Take and organize photos with timestamps
- **Injection Schedules** - Set reminders for regular injections
- **Titration Plans** - Plan and track gradual dose increases
- **Dosage Calculators** - Calculate reconstitution volumes and unit conversions
- **Side Effect Tracking** - Monitor and record medication side effects
- **Dark Mode UI** - Easy on the eyes with a modern slate theme

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/health-tracker-app.git
cd health-tracker-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### Deploy to GitHub Pages

1. Install the GitHub Pages plugin:
```bash
npm install --save-dev gh-pages
```

2. Add to your `package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/health-tracker-app",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. Deploy:
```bash
npm run deploy
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

Or simply drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop).

## Data Storage

All data is stored locally in your browser's localStorage. Your data never leaves your device.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Recharts (for data visualization)
- Lucide React (icons)

## License

MIT

## Disclaimer

This app is for personal tracking purposes only. Always consult with healthcare professionals before starting, stopping, or modifying any medication regimen.
