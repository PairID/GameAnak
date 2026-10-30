# 📦 Panduan Aplikasi Portabel: Petualangan Spidey Cilik

Game edukasi balita **Petualangan Spidey Cilik** telah dikonfigurasi agar dapat dimainkan secara portabel (mandiri tanpa instalasi rumit) di 3 platform utama: **Windows, Android, dan iOS**.

---

## 💻 1. Windows Portable (Desktop Executable)

Aplikasi portabel Windows dibuat menggunakan teknologi **WebView2 Native (.NET 8.0)** yang sangat ringan (hanya ~0.58 MB dalam format zip).

### Lokasi File:
- Folder: `portable-windows/PetualanganSpideyCilik-Windows/`
- Arsip Siap Pakai: `portable-windows/PetualanganSpideyCilik-Windows-Portable.zip`

### Cara Menjalankan di Windows:
1. Ekstrak file `PetualanganSpideyCilik-Windows-Portable.zip`.
2. Klik 2x pada file **`PetualanganSpideyCilik.exe`**.
3. Game langsung terbuka di jendela mandiri tanpa browser header / address bar.
4. **Fitur Khusus Ramah Anak**:
   - Tekan **F11**: Masuk / Keluar Mode Fullscreen Kiosk (Layar Penuh).
   - Tekan **Esc**: Keluar dari Mode Fullscreen.
   - Klik kanan dinonaktifkan agar anak tidak sengaja membuka menu browser.

---

## 📱 2. Android & iOS (Metode PWA 1-Click Install — Paling Mudah)

Game ini adalah **Progressive Web App (PWA)** dengan Service Worker dan Cache-First. Begitu dipasang ke Layar Utama (*Homescreen*), game akan berjalan persis seperti aplikasi native layar penuh dan **100% OFFLINE**.

### Live Web URL (GitHub Pages):
🌐 **`https://pairid.github.io/GameAnak/`**

### Cara Pasang di Android:
1. Buka link di atas menggunakan **Google Chrome**, **Microsoft Edge**, atau **Samsung Internet**.
2. Akan muncul banner otomatis **"Tambahkan ke Layar Utama"** atau klik menu titik tiga (⋮) di pojok kanan atas > pilih **"Instal aplikasi"** / **"Tambahkan ke Layar Utama"**.
3. Ikon Spidey Cilik akan langsung muncul di menu aplikasi HP/Tablet anak Anda.
4. Buka aplikasinya — game berjalan fullscreen tanpa address bar dan bisa dimainkan tanpa internet (mode pesawat).

### Cara Pasang di iPhone & iPad (iOS):
1. Buka link di atas menggunakan browser **Safari**.
2. Ketuk tombol **Share** (ikon kotak dengan tanda panah ke atas di bagian bawah layar).
3. Gulir ke bawah dan pilih **"Add to Home Screen"** (Tambahkan ke Layar Utama).
4. Ketuk **Add** (Tambah).
5. Ikon game akan muncul di Homescreen iPhone/iPad Anda dan berfungsi offline secara mandiri.

---

## 🤖 3. Android APK Standalone (Native Build via Capacitor)

Jika Anda memerlukan file installer `.apk` mandiri untuk diinstal pada tablet anak:

1. **Otomatis via GitHub Actions**:
   - Buka tab **Actions** di repositori GitHub: [https://github.com/PairID/GameAnak/actions](https://github.com/PairID/GameAnak/actions)
   - Jalankan workflow **"Build Android Portable APK"**.
   - Download file artefak **`PetualanganSpideyCilik-Android-Portable-APK.zip`** yang berisi file `app-debug.apk`.
2. **Build Manual di Komputer**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap add android
   npx cap sync android
   cd android && ./gradlew assembleDebug
   ```
   File APK akan tersedia di `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🍎 4. iOS Native Standalone (Xcode Project)

Untuk pengguna Mac/Apple yang ingin mengompilasi aplikasi ke format IPA atau mentransfer ke device iOS via kabel USB:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios
npx cap sync ios
npx cap open ios
```
Proyek akan terbuka di Xcode untuk ditandatangani (*signing*) dan dijalankan di iPhone atau iPad.
