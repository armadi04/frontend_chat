# Forum Chat Backend

Backend server untuk aplikasi Forum Chat dengan fitur realtime messaging menggunakan Socket.io.

## Instalasi

```bash
npm install
```

## Menjalankan Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Environment Variables

- `PORT` - Port server (default: 4000)
- `CLIENT_ORIGIN` - URL frontend yang diizinkan (default: http://localhost:3000)
- `MAX_MESSAGES` - Maksimal jumlah pesan yang disimpan (default: 200)
- `NODE_ENV` - Environment (development/production)

## API Endpoints

- `GET /health` - Health check
- `GET /messages` - Mendapatkan semua pesan
- `POST /messages` - Membuat pesan baru
- `DELETE /messages/:id` - Menghapus pesan

## Socket.io Events

### Client → Server
- `message:create` - Membuat pesan baru
- `message:delete` - Menghapus pesan

### Server → Client
- `message:new` - Pesan baru diterima
- `message:deleted` - Pesan dihapus

## Deployment

Server ini siap untuk di-deploy ke Railway, Render, atau platform Node.js lainnya.

