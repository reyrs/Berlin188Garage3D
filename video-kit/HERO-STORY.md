# Hero baru: BMW di bengkel Berlin 188, lalu terurai

> **Status (3 Okt 2026, sore):** terpasang di web dengan **BMW M4 (G82)**, dan hero sekarang **autoplay**
> (berputar sendiri, berulang; jeda otomatis saat tidak terlihat, ada tombol jeda di rail). Judul hero dan
> tombol booking tetap tampil; nama tahap ada di rail. Klip: `hero-buka`, `anatomi-2-urai` dan
> `anatomi-3-rakit` (versi mundur dari klip terurai, dibuat dengan ffmpeg) di `video-kit/clips/`; gambar
> diam B (frame terakhir klip terurai) dan C di `assets-src/anatomi/`. Adegan terakhir (serah terima)
> memakai gambar H1, mobil kembali di bengkel Berlin 188 dengan lampu menyala; gambar D tidak dipakai. Klip terurai sudah diperkecil
> 84,5% dan digeser supaya frame pertamanya pas dengan A. Gambar C saat ini menghadap ke kiri (sudut lain),
> jadi diperkecil dan ditaruh di posisi mobil yang sama; kalau C dibuat ulang menghadap kanan seperti A,
> adegan x-ray bisa jadi satu shot yang menyambung. Klip BMW 3 Series yang lama ada di
> `archive/video-kit-3series/`.

Satu mobil, satu kamera, enam gambar. Hanya bagian yang benar-benar **bergerak** yang dibuat video oleh
Veo; perubahan yang mobilnya diam (lampu padam, tembus pandang, cat kembali) dibuat oleh web dari
gambar diam, jadi tidak ada risiko meleleh dan tidak makan kredit:

```
H0 tertutup ══1══▶ H1 terbuka ──web──▶ A gelap ══3══▶ B terurai ══3 mundur══▶ A ──web scan──▶ C x-ray ──web──▶ D selesai
   (Veo: kain ditarik)          (pudar)           (Veo: terurai)  (klip 3 diputar balik)   (garis scan biru)     (sapuan cahaya, bengkel)   
```

`══` = video Veo, `──` = transisi web dari gambar diam. Total **2 video wajib**; klip 2 (lampu padam)
opsional, hanya kalau transisi web-nya terasa kurang.

Rumusnya sama dengan web referensi (Tesla, GRID01): **kamera diam, mobil sama persis di setiap
gambar, gambar akhir klip sebelumnya = gambar awal klip berikutnya**. Hasilnya di web terasa satu
shot panjang tanpa potongan.

## Bahan

| File | Isi |
|---|---|
| `start-frames/showroom-bmw-16x9.jpg` | Mobilnya: BMW 3 Series abu-abu (M Sport, gril hitam, kaliper biru). Sudut dan posisinya dipakai terus. |
| `../assets-src/bengkel/bay.jpg` | Foto asli bengkel: lantai epoxy biru, atap rangka baja putih, dinding seng biru, banner oli. |
| `../assets-src/bengkel/mezanin.jpg` | Foto asli bengkel: tangga kayu ke mezanin, banner, area servis. |
| `start-frames/logo-berlin188.png` | Logo Berlin 188 Garage (monogram B emas + tulisan BERLIN 188 GARAGE perak), untuk kain penutup mobil di H0. |

Foto bengkel asli adalah kunci supaya hasilnya **punya Berlin 188**, bukan garasi AI generik.

---

## Langkah 1: buat 6 gambar diam (Gemini / Nano Banana)

Semua **16:9 landscape**. Di Flow, set rasio gambar ke **Landscape (16:9)** sebelum generate; bawaannya
bisa portrait 9:16, dan gambar 9:16 tidak bisa dipakai untuk klip 16:9. Ukuran 1376×768 sudah cukup;
kalau ada pilihan unduh resolusi lebih besar, pakai itu. Simpan ke `start-frames/` dengan nama persis
seperti di bawah.

**Urutan pembuatan penting:** H1 dulu. H0 dan A dibuat dengan **mengedit H1**, B/C/D dengan
**mengedit A**. Jangan bikin dari nol, nanti mobilnya bergeser.

**Wajib dicek setelah semua jadi:** buka keenam gambar berurutan, klik bolak-balik. Mobil harus diam di
tempat yang sama (posisi, ukuran, sudut). Logo BMW di kap dan velg harus utuh. Kalau ada yang bergeser
atau logonya bengkok, generate ulang gambar itu saja.

### H1: `hero-h1-terbuka-16x9.png` (lampirkan `showroom-bmw-16x9.jpg`, `bay.jpg`, `mezanin.jpg`)

```
Use the first image for the car and the other two images for the place. Keep the grey BMW 3 Series
from the first image exactly as it is: same camera angle (front three-quarter view, car facing right),
same position and size in the frame, same paint, same black kidney grille, same headlights, same black
double-spoke wheels with blue brake calipers, same BMW roundel on the bonnet and on the wheels.
Replace the dark showroom with the workshop from the other two photos: a large car workshop with a
glossy blue epoxy floor, a high white steel truss roof with translucent skylight panels, blue
corrugated metal wall panels, a wooden staircase to a mezzanine and large hanging oil-brand banners.
The car is parked alone in a clear service bay; other cars and tools stay far in the background and
softly out of focus. The left third of the frame is calm (blue floor and soft background) so a headline
can sit over it. Bright, even daylight from the open front of the workshop plus the overhead high-bay
lamps, clean reflections of the car on the blue floor. The banners are out of focus with no readable
text. No people. Photorealistic automotive photograph, 16:9.
```

### H0: `hero-h0-tertutup-16x9.png` (lampirkan H1 dan `logo-berlin188.png`)

Kain penutupnya memakai logo Berlin 188 Garage, seperti cover mobil bermerek bengkel. Logo AI sering
meleset: cek hurufnya satu per satu (BERLIN, 188, GARAGE) dan bentuk monogram B-nya. Kalau tulisannya
rusak setelah 3–4 kali coba, pakai versi cadangan di bawahnya (monogram B saja).

```
Edit the first image. Keep the camera, the framing, the workshop and the car position exactly the same.
The BMW is now completely covered by a fitted dark charcoal satin car cover that follows the shape of
the car closely: the roofline, the bonnet, the mirrors and the wheel arches read clearly under the
fabric, and the lower half of the wheels shows below the cover. The logo from the second image is
printed large along the side of the cover, across the two doors, exactly as in the second image: the
gold "B" monogram on the left, a thin vertical silver line, and the words "BERLIN 188 GARAGE" in bold
italic silver letters stacked on three lines. Copy the logo exactly, with the same letters, shapes and
colours, and bend it naturally with the folds of the fabric. The dark background of the logo image is
not printed; only the logo itself. The overhead lamps are off and the workshop is dim: only cool, soft
daylight comes in from the open front, and the blue floor shows a faint reflection. No people, no other
text. Photorealistic, 16:9.
```

**Cadangan (monogram B saja):** ganti kalimat logo di prompt atas dengan:

```
Only the gold "B" monogram from the second image is printed large on the side of the cover, across the
two doors, copied exactly in shape and colour, bending naturally with the folds of the fabric.
```

### A: `anatomi-a-studio-16x9.png` (lampirkan H1)

```
Edit this image. Keep the grey BMW 3 Series exactly as it is: same position, same size, same angle,
same paint, same wheels, same BMW roundel and kidney grille, pixel-identical. Remove the entire
workshop: floor, roof, walls, staircase, banners and every other car. Replace the background with a
perfectly flat, solid deep navy colour #04152D that fills the whole frame edge to edge, with no
gradient, no vignette, no floor line and no horizon. Light the car from one large soft overhead light
with thin white rim lights along the roofline and the body sides, so the car reads clearly against
the dark background. Keep a very faint, soft contact shadow directly under the tyres only. No text,
no labels, no watermark. Photorealistic automotive studio photograph, 16:9.
```

### B: `anatomi-b-urai-16x9.png` (lampirkan A)

Bagian tersulit: AI cenderung memutar kamera atau menggandakan part. Prompt ini sengaja dibuat
sederhana. Cek: mobil tetap menghadap ke **kanan**, ukurannya sama dengan A, part tidak dobel.

```
Edit this image. Keep the camera angle, the framing and the car's position and size exactly the same:
front three-quarter view, the front of the car points to the right side of the frame. Keep the same
solid deep navy #04152D background. Turn the car into a clean exploded view: the whole body shell
(roof, pillars, doors and glass together) is lifted straight up by about half the car's height, so the
chassis underneath is visible. The four wheels are pulled straight outward from their axles by about
one wheel width, each with its brake disc and blue caliper between the wheel and the hub. The engine
and gearbox stay in their place on the chassis and are clearly visible. Every part appears exactly
once: one body shell, one engine, one gearbox, four wheels, four brakes. Nothing is duplicated, nothing
is rotated, nothing lies on the ground. Keep the BMW roundel on the bonnet and on the wheels sharp.
No text, no labels, no arrows, no people. Photorealistic, 16:9.
```

### C: `anatomi-c-xray-16x9.png` (lampirkan A)

Contoh arah yang benar dan yang salah: [`contoh-arah-C.png`](contoh-arah-C.png).

Gaya **phantom view** seperti ilustrasi resmi pabrikan, **bukan** neon. Kabel menyala biru, garis
putih di sekeliling mobil dan bodi yang tembus pandang separuh adalah ciri gambar AI generik. Efek
scan biru nanti dibuat oleh web (kode), jadi gambar ini cukup bersih. Cek: mesin ada di bawah kap di
belakang gril (bukan menembus bumper), dan tembus pandangnya rata dari depan sampai belakang.

```
Edit this image. Keep the camera angle, the framing and the car's position and size exactly the same:
front three-quarter view, the front of the car points to the right side of the frame. Do not mirror,
flip or rotate the image: the kidney grille stays on the right. Keep the same solid deep navy #04152D
background. Turn the car into a technical phantom-view cutaway, like an
official manufacturer press illustration. The whole body, the doors and the glass become evenly
semi-transparent grey, with exactly the same transparency from the front bumper to the rear bumper.
Inside, the real mechanical parts are visible in their correct places, in natural metal and graphite
colours: the inline-six engine under the bonnet behind the grille, the gearbox behind the engine, the
driveshaft to the rear axle, the brakes and suspension at each wheel, the seats. The bumper and the
grille stay in front of the engine. No glow, no neon, no bloom, no light trails, no glowing outline
around the car. A soft contact shadow under each tyre. Keep the BMW roundel sharp. No text, no labels,
no people. Photorealistic, 16:9.
```

### D: `anatomi-d-selesai-16x9.png` (lampirkan A) — tidak dipakai lagi

Adegan terakhir sekarang memakai H1 (mobil kembali di bengkel). Prompt ini disimpan sebagai cadangan.
Cek: cat sama seperti A,
ada bayangan di bawah ban (mobil tidak melayang), kaca memantulkan gelap (bukan ruangan bengkel).

```
Edit this image. Keep the camera angle, the framing, the car's position and size, and the paint colour
exactly the same as in this image; do not darken the paint. Keep the same perfectly flat, solid deep
navy #04152D background with no floor line, no horizon and no vignette. Light the car as if it stands
in a dark studio under one large soft light from above: broad soft highlights on the bonnet, the roof
and the doors, and the windows reflect only darkness, not a room. A soft dark contact shadow sits
directly under each tyre and a faint shadow under the body, so the car stands firmly on the ground.
The headlights and daytime running lights are switched on. No rings, no lines and no glow effects on
the ground. Keep the BMW roundel and kidney grille sharp. No text, no people. Photorealistic automotive
studio photograph, 16:9.
```

---

## Langkah 2: buat 2 video (Flow → Omni 1.1 Flash → keyframe awal dan akhir)

**Jangan generate video sebelum keenam gambar dicek.** Penyebab utama video gagal adalah gambar awal
dan akhir yang tidak cocok (mobil bergeser beberapa piksel, cat beda). Kirim gambarnya dulu: posisi
mobil dicek dengan overlay piksel.

Setelan setiap klip (model terbaru di Flow per Okt 2026: **Gemini Omni 1.1 Flash**, ada keyframe awal
dan akhir, mode draft 360p, dan upscale 1080p):

| Setelan | Pilih | Alasan |
|---|---|---|
| Model | **Omni 1.1 Flash** | Lebih baru dan lebih murah dari Veo 3.1; gerakan lambat dan benda kaku termasuk yang paling rapi hasilnya. |
| Durasi | **4 detik** | Di web kecepatan diatur scroll, jadi 4 detik (±96 frame) sudah mulus. File setengahnya, lebih cepat dimuat di HP. Kain ditarik juga lebih alami cepat. |
| Tes dulu | **Draft 360p** | Sepertiga harga. Cek gerakannya; kalau bersih, baru buat versi final. |
| Final | **720p, lalu upscale 1080p** | Web memutar maksimal 1600×900. |
| Rasio | **16:9** | Sama dengan gambar. |
| Jumlah hasil | **1 per prompt** | Ulang hanya kalau gagal. |

Kalau draft klip 3 (terurai) menunjukkan part meleleh atau bergeser di 4 detik, naikkan ke 6 detik:
gerakan yang lebih lambat lebih mudah dijaga bentuknya.

**Dari draft ke final:** kalau Flow punya tombol upscale langsung di hasil draft, pakai itu (hasilnya
sama persis). Kalau tidak, buat ulang dengan gambar, prompt dan durasi yang sama di 720p, lalu upscale
ke 1080p. Hasil final bisa sedikit beda dari draft karena dibuat ulang, jadi cek lagi dengan daftar
yang sama.

Upload **gambar awal** dan **gambar akhir**, tempel prompt, lalu negative prompt di bawah. Simpan ke
`video-kit/clips/` dengan nama **persis** seperti judul.

**Tidak perlu generate ulang** kalau masalahnya cuma: ada jeda diam di awal/akhir, temponya kurang
rata, atau 1–2 frame terakhir sedikit beda. Itu dipotong dan dirapikan saat `npm run videos`.
Generate ulang hanya kalau: mobil bergeser/berubah bentuk, logo BMW atau Berlin 188 rusak, roda atau
part bertambah/hilang, atau ada orang/tangan muncul.

**Negative prompt (semua klip):**

```
camera movement, camera shake, zoom, pan, cuts, scene change, speed ramp, slow motion, morphing car
shape, melting parts, extra wheels, extra parts appearing, parts disappearing, warped logo, distorted
BMW roundel, changing badge, text, labels, watermark, people, hands, background change, flicker,
lighting flicker
```

### 1: `clips/hero-buka-16x9.mp4`
Awal: H0 `hero-h0-tertutup-16x9.png` · Akhir: H1 `hero-h1-terbuka-16x9.png` · Draft 360p, 4 detik, 16:9, 1 hasil

**Prompt:**

```
A locked-off, perfectly static camera shot inside a car workshop, 4 seconds, 16:9. The first frame is
exactly the first image and the last frame is exactly the second image.

Scene: a light grey BMW M4 Competition coupe stands still on a glossy blue epoxy floor in a large car
workshop with a white steel truss roof and skylights, blue corrugated metal walls, a wooden staircase
to a mezzanine and hanging oil-brand banners. At the start the car is fully covered by a fitted dark
charcoal satin car cover with the Berlin 188 Garage logo printed on its side, and the workshop is dim.

Action, in this exact timing:
0.0 to 0.5 s: everything is still; the fabric tightens slightly at the rear as someone out of frame
starts to pull it.
0.5 to 3.0 s: the cover slides smoothly off the car from the front to the rear in one continuous pull,
rippling naturally like heavy satin, and leaves the frame on the left side. The logo on the fabric
stays the same and only bends with the folds. The car is revealed from the front bumper and the
kidney grille over the roof to the rear. At the same time the overhead high-bay lamps switch on row
by row and the whole workshop brightens to the daylight look of the second image.
3.0 to 4.0 s: the car stands fully revealed and perfectly still while the reflections on the paint and
on the blue floor settle; hold on the exact composition of the second image.

Keep identical in every frame: the camera position, lens and framing; the car's position, size,
angle, shape, light grey paint, black wheels and BMW roundels; the workshop layout, banners,
staircase and parked cars. Only the cover and the light change.

Style: photorealistic, real fabric physics, natural motion blur on the moving cover only, steady
pace, no slow motion.
```

**Negative prompt** (kalau tidak ada kolomnya, tempel di akhir prompt dengan awalan `Avoid:`):

```
camera movement, camera shake, zoom, pan, dolly, cuts, scene change, slow motion, speed ramp, car
moving, morphing car, changing paint colour, extra wheels, warped BMW roundel, garbled letters,
changing logo, new text, people, hands, arms, flicker, lighting flicker, background change
```

**Cek draft sebelum final:**
- Detik 0: kain dan logo sama dengan H0. Detik 4: sama dengan H1, tidak ada sisa kain di frame.
- Mobil tidak bergeser atau berubah bentuk saat kain lewat; cat tetap abu-abu muda.
- Tidak ada tangan atau orang yang muncul di kiri.
- Logo boleh sedikit kabur saat kain bergerak (layar pertama web memakai gambar H0 asli).

### 2 (opsional, nanti saja): `clips/anatomi-1-studio-16x9.mp4`
Awal: H1 `hero-h1-terbuka-16x9.png` · Akhir: A `anatomi-a-studio-16x9.png`

Awalnya dibuat oleh web (bengkel memudar ke navy). Generate klip ini hanya kalau transisi web-nya
terasa kurang hidup.

```
Start exactly on the first image and end exactly on the second image. The camera is completely still,
locked off on a tripod. The workshop lamps switch off one row after another, and the blue floor, the
roof, the walls, the staircase and the banners slowly fade into a flat deep navy darkness, until only
the car remains, lit from above with thin white rim lights, floating on a flat dark background. The car
itself never moves or changes. Smooth, steady, constant pace from start to end. One continuous shot,
no cuts.
```

### 3: `clips/anatomi-2-urai-16x9.mp4`
Awal: A `anatomi-a-studio-16x9.png` · Akhir: B `anatomi-b-urai-16x9.png` (versi yang sudah dirapikan)
· Draft 360p, 4 detik, 16:9, 1 hasil

**Prompt:**

```
A locked-off, perfectly static camera shot, 4 seconds, 16:9. The first frame is exactly the first
image and the last frame is exactly the second image.

Scene: a light grey BMW M4 Competition coupe on a perfectly flat, solid deep navy (#04152D)
background, presented like a clean engineering animation.

Action, in this exact timing:
0.0 to 0.4 s: the car is completely still.
0.4 to 3.4 s: the car comes apart in a calm, precise, mechanical way. The whole body shell, with the
roof, pillars, doors, glass, bonnet and bumpers, rises straight up in one piece at a constant speed.
Underneath it the chassis is revealed and stays exactly in place: the inline-six engine, the gearbox,
the driveshaft, the springs and the dampers. At the same time the four wheels slide straight outward
from their hubs along the axle lines, and the brake discs with the blue calipers slide out together
with them.
3.4 to 4.0 s: every part eases gently into its final position from the second image and holds
perfectly still.

Rules: every part moves in a straight line; nothing rotates, tumbles, bends or melts; no part is added
or lost; parts never pass through each other. The BMW roundels on the bonnet and the wheels and the
vertical kidney grille stay sharp. The navy background stays flat and unchanged, with no floor, no
horizon and no light effects appearing.

Style: photorealistic, precise, smooth constant speed, no slow motion.
```

**Negative prompt:**

```
camera movement, zoom, pan, cuts, scene change, slow motion, speed ramp, spinning parts, tumbling,
bending metal, melting, morphing, extra wheels, extra parts, duplicated engine, parts disappearing,
parts passing through each other, warped BMW roundel, text, labels, watermark, people, hands, floor,
horizon, sparks, smoke, glow, flicker
```

**Cek draft sebelum final:**
- Bodi naik lurus dan utuh (tidak pecah jadi pintu-pintu yang beterbangan).
- Tetap 4 roda, 1 mesin; tidak ada part yang berputar atau melengkung.
- Frame terakhir sama dengan B: bodi di atas, sasis dan roda di bawah, latar navy rata.
- Kalau ada part meleleh di 4 detik: draft ulang di **6 detik** dengan prompt yang sama (ganti
  `4 seconds` jadi `6 seconds` dan geser waktunya: 0–0.6 s, 0.6–5.2 s, 5.2–6 s).

### Klip 4 dan 5: tidak perlu

Rakit kembali = klip 3 versi mundur. X-ray dan adegan terakhir dibuat web dari gambar diam: garis scan
biru menyapu masuk gambar C, lalu sapuan cahaya putih membuka bengkel (H1). Tanpa kredit video.

---

## Langkah 3: cek, lalu masukkan ke web

Sebelum dipakai, putar setiap klip maju dan mundur:

- Mobil tidak bergeser, tidak meleleh, roda tetap empat.
- Logo BMW di kap dan velg utuh dari awal sampai akhir.
- Frame terakhir klip 1 terlihat sama dengan gambar H1, frame terakhir klip 3 sama dengan gambar B.
- Latar klip 3 rata, tanpa lantai atau garis cakrawala yang muncul.

Lalu jalankan:

```bash
npm run videos
```

Klip dikompres untuk scroll dan didaftarkan sebagai slot `hero-buka` dan `anatomi-2-urai` (plus
`anatomi-1-studio` kalau dibuat) di `src/data/media.ts`. Gambar A, B, C dan D masuk sebagai gambar
diam web. Setelah itu urutan adegan di `src/data/anatomy.ts`
disambungkan ke slot baru. Kalau warna latar video ternyata sedikit beda dari `#04152D` (Veo jarang
tepat), warna web yang disesuaikan: token `--color-stage` di `src/index.css`.

**HP:** web memakai klip 16:9 yang sama. Mobil tampil utuh di atas teks, jadi versi 9:16 tidak perlu.

---

## Foto asli tambahan untuk bagian "Perjalanan mobil Anda"

Bagian ini memakai foto asli bengkel. Tahap Check-in dan Pengerjaan sudah ada fotonya; Serah terima
sementara memakai foto mezanin. Yang belum ada (foto HP biasa, posisi landscape, siang hari, cukup 1–2 per tahap):

- **Diagnosis:** mekanik memasang scanner ke mobil, atau layar scanner dengan mobil di belakangnya.
- **Persetujuan:** foto temuan close-up (misalnya selang rembes atau kampas tipis) seperti yang dikirim
  ke customer.
- **Serah terima:** kunci mobil diserahkan di meja SA (wajah tidak perlu terlihat).

Taruh di `assets-src/bengkel/`, lalu `npm run images -- --bengkel`.
