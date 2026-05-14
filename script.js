const missionData = {
    water: { curr: 0, max: 8, icon: "💧", title: "H2O Intake", desc: "Target harian: Minum 8 gelas air mineral.", label: "Minum 1 Gelas" },
    veggie: { curr: 0, max: 3, icon: "🥦", title: "Veggie Power", desc: "Makan sayur di setiap jam makan utama.", label: "Sudah Makan Sayur" },
    fruit: { curr: 0, max: 2, icon: "🍎", title: "Fruit Punch", desc: "Minimal 2 porsi buah segar hari ini.", label: "Makan Buah" },
    junk: { curr: 0, max: 1, icon: "🚫", title: "No Junkfood", desc: "Berhasil menghindari gorengan & fast food.", label: "Misi Selesai" },
    sugar: { curr: 0, max: 1, icon: "🍦", title: "Sugar Limit", desc: "Tanpa minuman manis/boba hari ini.", label: "Misi Selesai" },
    sleep: { curr: 0, max: 1, icon: "😴", title: "Beauty Sleep", desc: "Tidur berkualitas minimal 8 jam.", label: "Misi Selesai" },
    sport: { curr: 0, max: 1, icon: "🏃", title: "Active Move", desc: "Olahraga/gerak aktif minimal 20 menit.", label: "Misi Selesai" },
    snack: { curr: 0, max: 1, icon: "🥜", title: "Smart Snack", desc: "Ganti snack micin dengan kacang/yogurt.", label: "Misi Selesai" },
    mindful: { curr: 0, max: 1, icon: "🧘", title: "Mindful Eating", desc: "Makan perlahan tanpa gangguan gadget.", label: "Misi Selesai" },
    sun: { curr: 0, max: 1, icon: "☀️", title: "Sunlight Seeker", desc: "Berjemur pagi 10-15 menit (Vit D).", label: "Misi Selesai" }
};

let activeTab = 'water';
let totalXP = parseInt(localStorage.getItem('nutriXP')) || 0;

window.onload = () => {
    getUserId(); 
    checkDailyReset();
    loadProgress();
    generateTabs();
    loadBMIHistory(); 
    updateXPDisplay();
    updateUI();
};

// --- LOGIKA IDENTITAS ---
function getUserId() {
    let userId = localStorage.getItem('nutriSpark_userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('nutriSpark_userId', userId);
    }
    return userId;
}

// --- FUNGSI BMI & CLOUD ---
function calculateBMI() {
    const nama = prompt("Masukkan nama kamu:") || "User Anonim";
    const w = parseFloat(document.getElementById('weight').value);
    const hInput = parseFloat(document.getElementById('height').value);
    const h = hInput / 100;
    
    if (w > 0 && h > 0) {
        const bmi = (w / (h * h)).toFixed(1);
        let status = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obesity";
        saveBMIToCloud(getUserId(), nama, w, hInput, bmi, status);
        Swal.fire('Berhasil!', `BMI: ${bmi} (${status})`, 'success');
    }
}

function saveBMIToCloud(userId, nama, berat, tinggi, bmi, kategori) {
    fetch('http://localhost:5000/api/save-bmi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, nama, berat, tinggi, bmi, kategori })
    })
    .then(() => loadBMIHistory());
}

function loadBMIHistory() {
    const userId = getUserId();
    const container = document.getElementById('bmi-history-list');
    fetch(`http://localhost:5000/api/get-bmi/${userId}`)
        .then(res => res.json())
        .then(history => {
            container.innerHTML = history.length ? history.map(item => `
                <div class="history-item">
                    <span><strong>${item.bmi}</strong> (${item.kategori})</span>
                    <span>${new Date(item.tanggal).toLocaleDateString()}</span>
                </div>
            `).join('') : `<p>Belum ada riwayat.</p>`;
        });
}

// --- FUNGSI MISI & XP ---
function updateUI() {
    const m = missionData[activeTab];
    document.getElementById('c-icon').innerText = m.icon;
    document.getElementById('c-title').innerText = m.title;
    document.getElementById('c-desc').innerText = m.desc;
    document.getElementById('p-curr').innerText = m.curr;
    document.getElementById('p-max').innerText = m.max;
    document.getElementById('p-bar').style.width = (m.curr / m.max * 100) + "%";
    
    const btn = document.getElementById('btn-act');
    btn.disabled = m.curr === m.max;
    btn.innerText = (m.curr === m.max) ? "Tuntas! ✅" : m.label;
}

function doAction() {
    const m = missionData[activeTab];
    if (m.curr < m.max) {
        m.curr++;
        localStorage.setItem('missionProgress', JSON.stringify(missionData));
        if (m.curr === m.max) {
            totalXP += 250;
            localStorage.setItem('nutriXP', totalXP);
            updateXPDisplay();
            checkRewards(); // Cek apakah dapet reward baru
            Swal.fire('Resilience!', `Misi ${m.title} tuntas. +250 XP`, 'success');
        }
        updateUI();
    }
}

// --- SISTEM REWARD (RESILIENCE MILESTONES) ---
function updateXPDisplay() { 
    document.getElementById('total-xp').innerText = totalXP;
    updateLevelName();
}

function updateLevelName() {
    let level = "Beginner";
    if (totalXP >= 5000) level = "Health Warrior 🛡️";
    else if (totalXP >= 2500) level = "Consistent Runner 🏃";
    else if (totalXP >= 1000) level = "Rising Star ⭐";
    
    const levelEl = document.getElementById('user-level');
    if(levelEl) levelEl.innerText = level;
}

function checkRewards() {
    // Logika popup saat mencapai XP tertentu
    if (totalXP === 1000) Swal.fire('Achievement!', 'Badge Unlocked: Rising Star! Kamu mulai konsisten.', 'info');
    if (totalXP === 5000) Swal.fire('Legendary!', 'Badge Unlocked: Health Warrior! Ketangguhanmu luar biasa.', 'info');
}

// --- LOGIKA PENUNJANG ---
function generateTabs() {
    const container = document.getElementById('tabs-container');
    container.innerHTML = '';
    Object.keys(missionData).forEach(k => {
        const btn = document.createElement('button');
        btn.className = `t-btn ${k === activeTab ? 'active' : ''}`;
        btn.innerText = missionData[k].title;
        btn.onclick = () => { activeTab = k; generateTabs(); updateUI(); };
        container.appendChild(btn);
    });
}

function checkDailyReset() {
    const lastDate = localStorage.getItem('lastVisitDate');
    const today = new Date().toDateString();
    if (lastDate && lastDate !== today) {
        Object.keys(missionData).forEach(k => missionData[k].curr = 0);
        localStorage.setItem('missionProgress', JSON.stringify(missionData));
    }
    localStorage.setItem('lastVisitDate', today);
}

function loadProgress() {
    const saved = localStorage.getItem('missionProgress');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(k => { if(missionData[k]) missionData[k].curr = parsed[k].curr; });
    }
}

function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }