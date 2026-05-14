const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // ID Unik dari browser (localStorage) agar data tidak bercampur antar pengunjung
    userId: { 
        type: String, 
        required: true 
    }, 
    nama: { 
        type: String, 
        default: "User Anonim" 
    },
    berat: { 
        type: Number 
    },
    tinggi: { 
        type: Number 
    },
    bmi: { 
        type: Number 
    },
    kategori: { 
        type: String 
    },
    tanggal: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('User', UserSchema);
