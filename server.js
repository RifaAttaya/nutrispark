require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); 

const app = express();

// Railway akan mengisi process.env.PORT secara otomatis, 
// tapi kita siapkan 8080 sebagai cadangan.
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Koneksi ke MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Mantap! Berhasil terhubung ke MongoDB Atlas'))
  .catch((err) => console.error('❌ Waduh, gagal konek ke MongoDB:', err));

// --- PINTU 1: SIMPAN DATA (POST) ---
app.post('/api/save-bmi', async (req, res) => {
    try {
        console.log("Ada data masuk dari user:", req.body.userId); 
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "Data BMI berhasil disimpan ke Cloud!" });
    } catch (error) {
        console.error("Gagal simpan:", error);
        res.status(500).json({ error: "Gagal menyimpan data" });
    }
});

// --- PINTU 2: AMBIL DATA SPESIFIK USER (GET) ---
app.get('/api/get-bmi/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const history = await User.find({ userId: userId }).sort({ tanggal: -1 });
        res.json(history);
    } catch (error) {
        console.error("Gagal ambil data:", error);
        res.status(500).json({ error: "Gagal mengambil riwayat" });
    }
});

// --- PINTU 3: TESTING SERVER ---
app.get('/', (req, res) => {
    res.send("Server NutriSpark & Database Aman Terkendali! ⚡");
});

// BAGIAN PALING PENTING UNTUK RAILWAY:
// Menggunakan '0.0.0.0' agar server bisa menerima koneksi dari luar (internet)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server jalan dan terbuka untuk umum di port ${PORT}`);
});
