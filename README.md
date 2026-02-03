# LG Inmobiliaria CRM (STITCH Clone)

A high-fidelity Real Estate CRM built with Next.js 14, Tailwind CSS, and Google Sheets as a backend.

## 🚀 Quick Start (Mock Mode)

You can run the application immediately without Google API keys. It will detect missing credentials and serve data from `data/seed.json`.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

## 🔌 Connecting to Google Sheets

To enable real persistence and multi-user sync:

1. Create a Google Cloud Project and enable **Google Sheets API**.
2. Create a **Service Account** and download the JSON key.
3. Create a Google Sheet with 4 tabs: `Properties`, `Appointments`, `GoldLeads`, `META`.
4. **Share** the Sheet with the Service Account email (Editor access).
5. In `META!A2`, type an initial date (e.g., `2023-01-01`).
6. Create a `.env.local` file:

```env
SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 🏗 Architecture

- **Frontend**: Next.js App Router, Tailwind CSS.
- **State**: React Query (TanStack Query) handles caching and background polling.
- **Backend**: Next.js API Routes act as a proxy to Google Sheets.
- **Sync**: The `useMetaPolling` hook checks `META!A2` every 4 seconds. If the timestamp changes, it invalidates queries to refresh UI.
- **Concurrency**: Writes require sending the current `version`. The server checks the Sheet's version column before writing.

## 📱 Features

- **Properties**: Card and Table views.
- **Appointments**: Daily agenda list.
- **Gold List**: Kanban-style pipeline.
- **WhatsApp**: Logic structure ready in `app/appointments/page.tsx` (button triggers).

## 🛠 Deployment

This project is optimized for Vercel.

1. Push to GitHub.
2. Import to Vercel.
3. Add the Environment Variables in Vercel settings.
4. Deploy.
