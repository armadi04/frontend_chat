# Panduan Deployment

Dokumen ini menjelaskan cara deploy aplikasi Forum Chat ke production.

## Struktur Deployment

- **Frontend (React)** → Deploy ke **Vercel**
- **Backend (Express + Socket.io)** → Deploy ke **Railway**

## Deploy Backend ke Railway

### Langkah 1: Persiapan
1. Pastikan file `server/package.json` sudah ada
2. Pastikan file `.railwayignore` sudah ada di root project

### Langkah 2: Deploy ke Railway
1. Buka https://railway.app dan login
2. Klik **"New Project"** → **"Deploy from GitHub repo"**
3. Pilih repository project Anda
4. Railway akan auto-detect Node.js project

### Langkah 3: Konfigurasi Railway
1. **Settings** → **Root Directory**: Biarkan kosong (atau isi `server` jika deploy dari folder server)
2. **Settings** → **Build Command**: `npm install` (atau `cd server && npm install`)
3. **Settings** → **Start Command**: `npm start` (atau `node server/index.js`)

### Langkah 4: Set Environment Variables
Di Railway Dashboard → **Variables**, tambahkan:

```
PORT=4000
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
MAX_MESSAGES=200
NODE_ENV=production
```

**Catatan**: Ganti `CLIENT_ORIGIN` dengan URL frontend Vercel Anda setelah frontend ter-deploy.

### Langkah 5: Dapatkan URL Backend
1. Railway akan memberikan URL seperti: `https://your-project.railway.app`
2. Copy URL ini untuk digunakan di frontend

## Deploy Frontend ke Vercel

### Langkah 1: Persiapan
1. Pastikan file `.env` atau environment variables sudah diset
2. Pastikan `ChatPage.jsx` menggunakan `process.env.REACT_APP_API_URL`

### Langkah 2: Deploy ke Vercel
1. Buka https://vercel.com dan login
2. Klik **"Add New Project"**
3. Import repository GitHub Anda
4. Vercel akan auto-detect Create React App

### Langkah 3: Konfigurasi Vercel
1. **Framework Preset**: Create React App
2. **Root Directory**: `.` (root)
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`

### Langkah 4: Set Environment Variables
Di Vercel Dashboard → **Settings** → **Environment Variables**, tambahkan:

```
REACT_APP_API_URL=https://your-project.railway.app
```

**Catatan**: Ganti dengan URL backend Railway yang sudah Anda dapatkan.

### Langkah 5: Deploy
1. Klik **"Deploy"**
2. Tunggu proses build selesai
3. Vercel akan memberikan URL seperti: `https://your-project.vercel.app`

## Testing Deployment

### Test Backend
1. Buka: `https://your-project.railway.app/health`
   - Harus return: `{"status":"ok"}`
2. Buka: `https://your-project.railway.app/messages`
   - Harus return array pesan (bisa kosong `[]`)

### Test Frontend
1. Buka URL Vercel Anda
2. Login dan coba kirim pesan
3. Buka Developer Tools → Console, pastikan tidak ada error
4. Test dengan 2 browser berbeda untuk memastikan realtime chat bekerja

## Troubleshooting

### Backend tidak bisa diakses
- Pastikan `PORT` environment variable sudah diset
- Pastikan Railway service status adalah "Running"
- Cek logs di Railway Dashboard

### CORS Error
- Pastikan `CLIENT_ORIGIN` di Railway sesuai dengan URL Vercel
- Pastikan menggunakan HTTPS (bukan HTTP)

### Socket.io tidak connect
- Pastikan URL menggunakan HTTPS
- Pastikan `REACT_APP_API_URL` di Vercel sudah benar
- Cek browser console untuk error detail

### Frontend tidak bisa connect ke backend
- Pastikan environment variable `REACT_APP_API_URL` sudah diset di Vercel
- Rebuild frontend setelah set environment variable
- Pastikan URL backend menggunakan HTTPS

## Catatan Penting

1. **Data Persistence**: Data di `messages.json` akan hilang saat redeploy. Untuk production, pertimbangkan menggunakan database (MongoDB, PostgreSQL, dll).

2. **Custom Domain**: Railway dan Vercel mendukung custom domain. Setup di Settings masing-masing platform.

3. **Environment Variables**: Jangan commit file `.env` ke repository. Gunakan environment variables di platform deployment.

4. **Cost**: Railway dan Vercel memiliki free tier yang cukup untuk project kecil. Monitor usage di dashboard masing-masing.

