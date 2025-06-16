# Flood Dash 🌊

A real-time water level monitoring dashboard for flood prevention and management. Built with Next.js and Supabase, Flood Dash provides comprehensive water level tracking with interactive charts, alert systems, and device management.

## Features

- **Real-time Water Level Monitoring**: Live charts displaying water levels across multiple devices
- **Interactive Time Ranges**: View data for 1 hour, 6 hours, 24 hours, or 7 days
- **Alert System**: Automated alerts for high/low water levels, rapid changes, battery issues, and device errors
- **Device Management**: Add, configure, and manage water level sensors
- **Location Mapping**: GPS coordinates with OpenStreetMap integration
- **Data Sharing**: Share specific device data via shareable links
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL database, real-time subscriptions)
- **UI Components**: Radix UI primitives with custom styling
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner toast notifications

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account and project

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/flood-dash.git
cd flood-dash
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up your Supabase database:
   Create the following tables in your Supabase project:

```sql
-- Devices table
CREATE TABLE devices (
  device_id TEXT PRIMARY KEY,
  name TEXT,
  offset_mm INTEGER DEFAULT 0,
  lat REAL,
  lng REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Water levels table
CREATE TABLE water_levels (
  id SERIAL PRIMARY KEY,
  device_id TEXT REFERENCES devices(device_id),
  water_level REAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  device_id TEXT REFERENCES devices(device_id),
  type TEXT CHECK (type IN ('high', 'low', 'rate_change', 'battery', 'error')),
  value REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Dashboard

- View real-time water level data from all connected devices
- Switch between different time ranges (1h, 6h, 24h, 7d)
- Share specific device data using the share button
- Monitor alerts and device status

### Device Management

- Navigate to `/devices` to manage your water level sensors
- Add new devices with GPS coordinates
- Configure device-specific settings like offset calibration

### Alarm Configuration

- Access `/alarms` to set up automated alerts
- Configure thresholds for high/low water levels
- Set up notifications for rapid level changes or device issues

## Project Structure

```
flood-dash/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── alarms/         # Alarm configuration page
│   │   ├── devices/        # Device management page
│   │   ├── login/          # Authentication page
│   │   └── page.tsx        # Main dashboard
│   ├── components/         # Reusable UI components
│   │   └── ui/            # shadcn/ui components
│   └── lib/               # Utility functions and configurations
├── public/                # Static assets
└── package.json          # Dependencies and scripts
```

## API Integration

The dashboard integrates with Supabase for:

- Real-time data fetching from `water_levels` table
- Device management via `devices` table
- Alert monitoring through `alerts` table
- Real-time subscriptions for live updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more deployment options.
