# LG Inmobiliaria CRM

A real-time Real Estate CRM built with Next.js 14 and Google Sheets.

## 🔐 Setup Credentials (Required for Production)

For the application to connect to Google Sheets securely (Server-Side only), you must configure the following environment variables.

### 1. Google Cloud Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project.
3. Enable the **Google Sheets API**.
4. Go to **IAM & Admin > Service Accounts**.
5. Create a Service Account and generate a **JSON Key**.
6. Download the JSON file.

### 2. Google Sheet Setup
1. Create a new Google Sheet.
2. Rename tabs to exactly: `Properties`, `Appointments`, `GoldLeads`, `META`.
3. In `META!A1` write `last_change_ts`.
4. In `META!A2` write an initial date (e.g., `2023-01-01T00:00:00.000Z`).
5. **Share** the spreadsheet with the `client_email` found in your JSON key (Give it **Editor** access).
6. Copy the Spreadsheet ID from the URL: `docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit`.

### 3. Environment Variables (.env.local)
Create a `.env.local` file in the root directory:

```env
SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```
*Note: Ensure the private key is enclosed in quotes and includes the `\n` characters exactly as shown in the JSON file.*

## 🚀 Development

### Run with Mock Data (No Keys)
If no environment variables are present, the app falls back to `data/seed.json` automatically.

```bash
npm run dev
```

### Run with Real Data
1. Configure `.env.local`
2. Run `npm run dev`
3. Visit `/api/health` to verify connection.

## 📦 Deployment on Vercel

1. Import project to Vercel.
2. Add the environment variables in the Project Settings.
3. Deploy.
