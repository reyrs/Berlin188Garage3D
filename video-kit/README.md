# Video kit — video yang diputar mengikuti scroll

Website sudah jalan dengan foto. Setiap foto punya "slot video": begitu klipnya ada,
video itu otomatis menggantikan foto dan diputar maju/mundur mengikuti scroll
(bukan autoplay). Foto tetap jadi cadangan kalau video belum termuat.

Semua gambar awal (start frame) ada di `start-frames/`, ukurannya sudah pas untuk
image-to-video (Higgsfield, Gemini/Veo, Kling, Runway, dll.).

## Alur kerja

1. Buka generator image-to-video, unggah **start frame** sebagai gambar awal.
2. Tempel prompt dari tabel di bawah (bahasa Inggris, model video lebih patuh).
   Kalau ada kolom *negative prompt*, pakai negative prompt umum di bawah.
3. Setelan: durasi **5–8 detik**, 1080p, 24–30 fps. Audio tidak dipakai.
4. Cek hasilnya: **logo di grill harus tetap utuh** (AI sering membengkokkan logo
   dan tulisan). Kalau logo berubah bentuk, generate ulang.
5. Simpan dengan **nama yang sama dengan start frame-nya**, ekstensi `.mp4`
   (atau `.mov`/`.webm`), ke folder `video-kit/clips/`. Contoh:
   `start-frames/showroom-bmw-16x9.jpg` → `clips/showroom-bmw-16x9.mp4`
6. Jalankan `npm run videos`. Script mengompres klip untuk scroll (keyframe rapat),
   menaruh hasilnya di `public/videos/`, dan mendaftarkannya di `src/data/media.ts`.
   Klip yang sudah diproses dilewati; `npm run videos -- --force` untuk proses ulang.

Prioritas: 6 video showroom dulu (paling terlihat, di layar pertama). Video layanan opsional.

**Showroom cukup versi 16:9.** Versi HP (9:16) dipotong otomatis dari video 16:9,
dengan titik tengah di depan mobil (sama seperti fotonya). Buat `-9x16` sendiri
hanya kalau hasil potongannya kurang bagus.

## Aturan gerak (penting untuk video scroll)

Video ini diputar maju-mundur sesuai jari/mouse, jadi gerakannya harus:

- **Satu shot tanpa potongan**, kecepatan kamera **konstan** (tanpa slow-mo/speed ramp).
- Gerak kamera pelan dan halus: orbit atau dolly. Tanpa goyangan, tanpa zoom mendadak.
- Mobil **diam** (tidak berjalan), lampu dan pencahayaan ruangan tetap.
- Tanpa teks/tulisan baru, tanpa orang tambahan.
- Terlihat bagus diputar maju maupun mundur.

**Negative prompt umum:**

```
cuts, scene change, fast motion, speed ramp, camera shake, zoom jump, morphing, warped logo,
distorted badge, changing text, extra wheels, car driving, people appearing, flicker, lighting change
```

## Showroom (16:9) — prompt per merek

Semua mobil di foto menghadap ke kanan. Kamera berputar ke kanan, ke arah depan mobil,
jadi saat di-scroll wajah dan logonya makin terlihat.

| Start frame | Prompt |
|---|---|
| `showroom-bmw-16x9.jpg` | Slow cinematic camera orbit around the parked grey BMW 3 Series sedan, starting exactly from this frame. The camera arcs about 25 degrees to the right toward the front of the car at a constant, steady speed while gently dollying closer. The car stays still, headlights on. Soft reflections glide across the glossy black floor and the paint. Dark concrete showroom, lighting unchanged. One continuous shot, no cuts. Keep the BMW roundel and kidney grille sharp and exactly as in the image. Photorealistic. |
| `showroom-mercedes-benz-16x9.jpg` | Slow cinematic camera orbit around the parked black Mercedes-AMG E-Class Estate, starting exactly from this frame. The camera arcs about 25 degrees to the right toward the front at a constant, steady speed while gently dollying closer. The car stays still, headlights on. Highlights slide along the black paint and the glossy floor. Dark concrete showroom, lighting unchanged. One continuous shot, no cuts. Keep the three-pointed star on the grille and the AMG plate sharp and exactly as in the image. Photorealistic. |
| `showroom-audi-16x9.jpg` | Slow cinematic camera orbit around the parked grey Audi Q7, starting exactly from this frame. The camera arcs about 25 degrees to the right toward the front at a constant, steady speed while gently dollying closer. The car stays still, headlights on. The LED ceiling strips reflect and slide across the bonnet and the glossy floor. Lighting unchanged. One continuous shot, no cuts. Keep the four rings on the grille sharp and exactly as in the image. Photorealistic. |
| `showroom-volkswagen-16x9.jpg` | Slow cinematic camera orbit around the parked blue Volkswagen Golf R, starting exactly from this frame. The camera arcs about 25 degrees to the right toward the front at a constant, steady speed while gently dollying closer. The car stays still, the light bar across the front stays lit. The LED ceiling strips reflect and slide across the blue paint and the glossy floor. One continuous shot, no cuts. Keep the VW badge sharp and exactly as in the image. Photorealistic. |
| `showroom-mini-16x9.jpg` | Slow cinematic camera orbit around the parked green MINI Countryman JCW with a red roof and red bonnet stripes, starting exactly from this frame. The camera arcs about 25 degrees to the right toward the front at a constant, steady speed while gently dollying closer. The car stays still, headlights on. Reflections slide across the paint and the glossy floor. One continuous shot, no cuts. Keep the JCW plate and the MINI badge sharp and exactly as in the image. Photorealistic. |
| `showroom-land-rover-16x9.jpg` | Slow cinematic camera orbit around the parked matte grey Land Rover Defender, starting exactly from this frame. The camera arcs about 25 degrees to the right toward the front at a constant, steady speed while gently dollying closer. The car stays still, round headlights on, warm light on the grille. Reflections slide across the glossy floor. One continuous shot, no cuts. Keep the DEFENDER lettering on the bonnet and the grille badge sharp and exactly as in the image. Photorealistic. |

## Layanan (9:16) — opsional

Foto layanan: studio putih, mekanik berseragam hitam. Wajah manusia paling rawan
berubah di video AI, jadi gerakan orangnya dibuat kecil. Awali setiap prompt dengan:

> Starting exactly from this frame, the camera slowly and steadily dollies in toward the work at a constant speed. White seamless studio, lighting unchanged. One continuous shot, no cuts. The mechanics keep working with small, natural movements; faces and uniforms stay consistent. No text.

lalu tambahkan kalimat aksinya:

| Start frame | Aksi (tambahkan ke prompt pembuka) |
|---|---|
| `service-turun-mesin-9x16.jpg` | The red engine crane slowly lifts the engine a little higher out of the black sedan. |
| `service-overhaul-transmisi-9x16.jpg` | The transmission is lowered slowly on the jack under the lifted car. |
| `service-flushing-transmisi-9x16.jpg` | The mechanic connects the flushing machine hose; the machine's fluid gauge moves slightly. |
| `service-tune-up-9x16.jpg` | The kneeling mechanic raises the air filter to inspect it; the others check the engine bay. |
| `service-kalibrasi-injector-9x16.jpg` | Fuel sprays evenly from the injectors and the measuring tubes of the tester slowly fill. |
| `service-scan-all-brand-9x16.jpg` | The mechanic scrolls through scan results on the tablet; the screen glows softly. |
| `service-coding-ecu-9x16.jpg` | The mechanic types on the diagnostic laptop connected to the car; a progress bar fills on screen. |
| `service-service-hardware-ecu-9x16.jpg` | The soldering iron touches the ECU circuit board; a thin wisp of smoke rises. |
| `service-balancing-shaking-9x16.jpg` | The wheel on the balancing machine spins up slowly and steadily. |
| `service-service-ac-9x16.jpg` | The AC service machine runs; a faint cold mist drifts from the air vent. |
| `service-salon-body-9x16.jpg` | The polisher glides across the door panel, leaving a deep gloss behind it. |
| `service-pengadaan-sparepart-9x16.jpg` | A mechanic places one more parts box onto the trolley. |
| `service-fast-import-sparepart-9x16.jpg` | The mechanic opens the flaps of the shipping box and looks inside. |
| `service-towing-24-jam-9x16.jpg` | The flatbed slowly lowers the SUV down the ramp. |

## Ukuran file

Klip dikompres ke 1600×900 (16:9) dan 720×1280 (9:16), 30 fps maks, dengan keyframe
setiap 6 frame supaya scroll maju-mundur tetap mulus. Hasilnya lebih besar dari video
biasa (sekitar 1–4 MB per 5 detik), jadi pakai durasi 5–8 detik saja. Browser hanya
mengunduh video yang sedang atau akan segera tampil.

`ffmpeg` sudah ikut sebagai dev dependency (`ffmpeg-static`). Kalau `npm install`
menahan script instalasinya, jalankan `npm approve-scripts ffmpeg-static`, atau pasang
ffmpeg biasa di PATH.
