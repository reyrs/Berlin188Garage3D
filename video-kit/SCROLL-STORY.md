# Scroll story: animasi scroll ala web viral

> **Status (25 Sep 2026):** section "Anatomi servis" sudah tayang di homepage
> (`src/components/anatomy/Anatomy.tsx`, teks di `src/data/anatomy.ts`), di antara showroom dan layanan.
> Versi pertama memakai:
>
> | Adegan | Media | Sumber |
> |---|---|---|
> | Mulai | video `anatomi-padam` | `BMW_showroom_fades_to_dark_20260925193249.mp4` |
> | Bongkar | video `anatomi-bongkar` | `BMW_transitioning_in_dark_studio_20260925193249.mp4`, dipotong mulai detik 1,5 (lampu sempat mati mendadak di awal) |
> | Periksa | gambar `urai` (exploded view) + 4 label | `assets-src/anatomi/urai.jpg` |
> | Diagnosa | gambar `xray` + garis scan + 3 label | `assets-src/anatomi/xray.jpg` |
> | Rakit | video `anatomi-rakit` | `BMW_transition_to_solid_paint_20260925193249.mp4` |
> | Serah | gambar `serah` (garis merah) + tombol booking | `assets-src/anatomi/serah.jpg` |
>
> Video-video ini dibuat dari teks (bukan Frames to Video), jadi model BMW dan sudut kameranya
> berbeda di tiap adegan. Di web, perpindahan adegan disamarkan dengan crossfade di atas background
> gelap. Untuk versi berikutnya yang benar-benar menyambung (mobil yang sama dari awal sampai akhir),
> generate ulang lewat **Frames to Video** dengan gambar awal + gambar akhir seperti di bawah, lalu
> ganti file di `video-kit/clips/` dengan nama yang sama dan jalankan `npm run videos`.
>
> Gambar diam diproses dengan `npm run images -- --anatomi`. Posisi label ada di `src/data/anatomy.ts`
> (persen dari lebar/tinggi gambar 16:9). Kalau gambarnya diganti, posisinya perlu dicek ulang.

Ini teknik yang dipakai web-web viral di TikTok/IG/YT ("Apple-style scroll animation"):

1. Buat **2 gambar diam**: gambar awal dan gambar akhir (misalnya mobil utuh, lalu mobil terurai jadi part).
2. AI video (**Veo 3.1 "Frames to Video"** atau **Kling start/end frame**) membuat transisi mulus di antara keduanya.
3. Video diputar **frame demi frame mengikuti scroll**, dan teks muncul bertahap di titik tertentu.

Rahasia supaya hasilnya kelihatan mahal:

- **Background polos dengan warna persis sama dengan web** (`#181818`, jet black). Tepi video menyatu
  dengan halaman, jadi mobil seperti melayang di web, bukan "video di dalam kotak".
- **Kamera diam.** Yang bergerak objeknya. Kamera yang diam membuat klip mudah disambung dan enak di-scroll
  maju-mundur.
- **Satu mobil yang sama di semua adegan.** Semua gambar dibuat dari gambar sebelumnya (referensi),
  bukan dari nol.
- **Klip disambung berantai.** Gambar akhir klip 1 = gambar awal klip 2, dan seterusnya. Di web jadi satu
  cerita panjang tanpa potongan.

## Alat

| Tahap | Alat | Catatan |
|---|---|---|
| Gambar diam | Gemini (Nano Banana), upload gambar referensi | Selalu lampirkan gambar sebelumnya sebagai referensi. |
| Video | Google Flow → Veo 3.1 → **Frames to Video** | Hasil 8 detik. Pilih 16:9, 1080p. Suara tidak dipakai. |
| Video (alternatif) | Kling (start & end frame), Higgsfield | Matikan fitur auto-enhance / "improve prompt" kalau ada. |

Buat 2–4 variasi tiap klip, lalu pilih yang paling mulus. **Cek logo BMW di kap dan velg**: kalau bentuknya
berubah atau meleot, generate ulang.

## Mobil utama

BMW 3 Series abu-abu dari `start-frames/showroom-bmw-16x9.jpg` (foto pertama homepage). Jadi animasi
ini menyambung langsung dari showroom.

## Alur cerita (4 klip berantai, 16:9)

```
showroom-bmw-16x9.jpg ──1──▶ A (studio gelap) ──2──▶ B (exploded) ──3──▶ C (x-ray) ──4──▶ D (selesai)
```

| Klip | Dari → ke | Isi | Teks yang muncul di web (layanan asli) |
|---|---|---|---|
| 1 `anatomi-1-studio` | foto showroom → A | Lampu showroom padam, ruangan hilang, tinggal mobil melayang | "Kami bongkar sampai ke akarnya" |
| 2 `anatomi-2-urai` | A → B | Mobil terurai jadi exploded view | Bodi & Eksterior, Mesin & Transmisi, Kaki-kaki & Rem |
| 3 `anatomi-3-xray` | B → C | Part menyatu lagi, bodi jadi kaca tembus pandang, kabel menyala biru | Elektrikal & Komputer: scan all brand, coding ECU |
| 4 `anatomi-4-selesai` | C → D | Sapuan cahaya mengembalikan cat, lampu menyala, garis merah melengkung | Serah terima, CTA booking WhatsApp |

---

## Langkah 1: buat 4 gambar diam (Gemini / Nano Banana)

Simpan di `start-frames/` dengan nama di bawah. Semua 16:9, minimal 1920×1080.

**Wajib sebelum lanjut:** buka gambar-gambar ini berurutan dan bolak-balik di-klik. Posisi dan ukuran
mobil harus **sama persis**. Kalau mobil bergeser, videonya ikut bergeser.

### A: `anatomi-a-studio-16x9.png` (lampirkan `showroom-bmw-16x9.jpg`)

```
Edit this image. Keep the grey BMW 3 Series exactly as it is: same position, same size, same angle,
same paint, same wheels, same BMW roundel and kidney grille, pixel-identical. Remove the entire
showroom: walls, pillars, ceiling light panel, BMW wall sign and the reflective floor. Replace the
background with a perfectly flat, solid #181818 dark charcoal colour that fills the whole frame edge to
edge, with no gradient, no vignette, no floor line and no horizon. Light the car from one large soft
overhead light with thin white rim lights along the roofline and the body sides, so the car reads
clearly against the dark background. Keep a very faint, soft contact shadow directly under the tyres
only. No text, no labels, no watermark. Photorealistic automotive studio photograph, 16:9.
```

### B: `anatomi-b-urai-16x9.png` (lampirkan gambar A)

```
Same BMW 3 Series from the reference image, same camera angle, same framing, same lighting, same solid
#181818 background. The car is now shown as a precise technical exploded view, like a premium
engineering illustration photographed for real. The body shell is lifted straight up about 40 cm. The
bonnet, the four doors, the front and rear bumpers float outward along their mounting directions. The
inline-six engine and the automatic gearbox hover in the centre where they sit in the car. The four
wheels are pulled straight outward, each followed by its brake disc, blue brake caliper, spring and
damper, spaced evenly along the axle line. The battery, the ECU control unit and the wiring harness
float just below the roof. Every part is clean, aligned, evenly spaced and not overlapping. The whole
assembly fits inside the frame with a comfortable margin on every side. Keep the BMW roundel on the
bonnet and on the wheels sharp and exactly as in the reference. No text, no labels, no arrows, no
people. Photorealistic, 16:9.
```

### C: `anatomi-c-xray-16x9.png` (lampirkan gambar A)

```
Same BMW 3 Series from the reference image, same camera angle, same framing, same solid #181818
background. The car is fully assembled, but the body panels, doors and glass are now translucent dark
smoked glass, so the inside of the car is visible: the inline-six engine, the gearbox, the brakes, the
suspension and the seats in matte graphite. The complete wiring harness, the ECU control units and the
headlight wiring glow in bright blue (#0065C0) with a soft bloom, like a live diagnostic scan. The
outline of the body keeps a thin, clean white edge light. Keep the BMW roundel on the bonnet readable.
No text, no labels, no people. Photorealistic high-tech render, 16:9.
```

### D: `anatomi-d-selesai-16x9.png` (lampirkan gambar A)

```
Same BMW 3 Series from the reference image, same camera angle, same framing, same solid #181818
background. The car is solid again with freshly machine-polished grey paint and a deep, flawless gloss.
Soft white light streaks reflect along the bonnet and the doors. The headlights and daytime running
lights are switched on. On the ground under the car, a single thin, softly glowing red (#F9000D) curved
line arcs around the front of the car like part of a large circle, reflected faintly on the ground.
Keep the BMW roundel and kidney grille sharp and exactly as in the reference. No text, no people.
Photorealistic automotive studio photograph, 16:9.
```

---

## Langkah 2: buat 4 video (Flow → Veo 3.1 → Frames to Video)

Setiap klip: upload **gambar awal** dan **gambar akhir**, tempel prompt, lalu tambahkan negative prompt.
Hasil disimpan ke `clips/` dengan nama persis seperti di bawah.

**Negative prompt (semua klip):**

```
camera movement, camera shake, zoom, pan, cuts, scene change, speed ramp, slow motion, morphing car
shape, melting parts, extra wheels, extra parts appearing, parts disappearing, warped logo, distorted
BMW roundel, changing badge, text, labels, watermark, people, hands, background change, gradient
background, flicker, lighting flicker
```

### 1: `clips/anatomi-1-studio-16x9.mp4`
Awal: `showroom-bmw-16x9.jpg` · Akhir: `anatomi-a-studio-16x9.png`

```
Start exactly on the first image and end exactly on the second image. The camera is completely still,
locked off on a tripod. The showroom lights switch off one after another, and the walls, ceiling panel,
BMW wall sign and reflective floor slowly fade into solid darkness, until only the car remains, lit
from above with thin white rim lights, floating on a flat dark background. The car itself never moves
or changes. Smooth, steady, constant pace from start to end. One continuous shot, no cuts.
```

### 2: `clips/anatomi-2-urai-16x9.mp4`
Awal: `anatomi-a-studio-16x9.png` · Akhir: `anatomi-b-urai-16x9.png`

```
Start exactly on the first image and end exactly on the second image. The camera is completely still.
The car slowly and precisely disassembles itself into a technical exploded view: the body shell lifts
straight up, the bonnet, doors and bumpers glide outward, the wheels slide straight out along the
axles followed by the brakes, springs and dampers, and the engine and gearbox are revealed hovering in
the centre. Every part moves in a straight line at the same constant speed and settles exactly into its
place in the second image. Nothing spins, nothing new appears, nothing disappears. The flat #181818
background never changes. One continuous shot, no cuts.
```

### 3: `clips/anatomi-3-xray-16x9.mp4`
Awal: `anatomi-b-urai-16x9.png` · Akhir: `anatomi-c-xray-16x9.png`

```
Start exactly on the first image and end exactly on the second image. The camera is completely still.
All the parts glide back together along straight lines at a constant speed and lock into place. As the
body closes, the panels and glass turn into translucent dark smoked glass, and the wiring harness and
ECU units light up in glowing blue, spreading from the front of the car to the rear like a diagnostic
scan. The flat #181818 background never changes. One continuous shot, no cuts.
```

### 4: `clips/anatomi-4-selesai-16x9.mp4`
Awal: `anatomi-c-xray-16x9.png` · Akhir: `anatomi-d-selesai-16x9.png`

```
Start exactly on the first image and end exactly on the second image. The camera is completely still.
A thin vertical band of white light sweeps slowly and steadily from the front of the car to the rear.
Behind the band, the translucent glass body turns back into solid, freshly polished grey paint and the
blue glow fades out. At the end, the headlights switch on and a thin red curved light line fades in on
the ground around the front of the car. The car never moves. One continuous shot, no cuts.
```

## Langkah 3: masukkan ke web

Taruh keempat klip di `video-kit/clips/`, lalu jalankan `npm run videos`. Klip otomatis dikompres untuk
scroll dan didaftarkan sebagai slot `anatomi-1-studio` sampai `anatomi-4-selesai`.

Tampilan di HP: karena background-nya polos `#181818` (sama dengan halaman), video 16:9 bisa tampil utuh
di layar HP tanpa kelihatan kotaknya. Versi 9:16 khusus (tampak atas) bisa dibuat nanti kalau mobilnya
terasa terlalu kecil.

## Nanti: mobil lain

Setelah BMW jadi, rantai yang sama bisa diulang untuk merek lain (Mercedes, Audi, VW, MINI, Land Rover),
mulai dari foto showroom masing-masing. Di web bisa dibuat tombol ganti mobil.
