export interface GaragePrompt {
  id: string;
  chapter: string;
  title: string;
  duration: string;
  cameraMovement: string;
  promptText: string;
  notes: string;
}

export const NEGATIVE_PROMPT =
  'cuts, montage, fast transitions, speed ramp, shaky cam, sudden zoom, cartoonish, low resolution, warped car body, melting logo, changing text, glitching reflections, distorted mechanics, flicker, blurry textures, amateur lighting';

export const MASTER_PROMPT_16X9 = {
  title: 'Master Continuous Garage Sequence (16:9 Widescreen)',
  aspectRatio: '16:9',
  duration: '10–15 detik (atau 240–360 frames)',
  cameraMovement: 'Single continuous uninterrupted forward dolly & gentle 20-degree arc',
  prompt: `Photorealistic cinematic 4K video of a luxury European specialist automotive workshop named "Berlin 188 Garage". The camera executes one continuous, ultra-smooth, slow forward dolly shot gliding past the workshop floor into the main service bay. 

The garage features dark charcoal polished concrete epoxy floors with elegant curved red safety boundary lines, industrial exposed dark beams, and bright continuous linear LED light bars running along the ceiling. In the center sits a metallic blue sports car parked between a heavy-duty two-post Berlin Blue hydraulic lift. In the background, organized black steel Hazet tool chests, tire racks, and a diagnostic trolley with a glowing computer monitor are visible. 

The camera slowly glides forward and slightly arcs around the car at a steady, perfectly constant cinematic speed. Soft, pristine white lightformers and warm tungsten work spotlights reflect beautifully across the car's glossy clearcoat and the polished floor. Extremely clean, sterile, high-end hypercar repair facility aesthetic. 

One single continuous take with no cuts, no speed changes, constant camera velocity, 24fps cinematic motion blur, photorealistic depth of field, anamorphic lens flares.`,
};

export const MASTER_PROMPT_9X16 = {
  title: 'Master Continuous Garage Sequence (9:16 Mobile Portrait)',
  aspectRatio: '9:16',
  duration: '10–15 detik',
  cameraMovement: 'Vertical continuous slow tracking shot, low to high elevation',
  prompt: `Vertical 9:16 aspect ratio, ultra-photorealistic 4K cinematic video of a pristine European specialist supercar garage. The camera begins at floor level looking up at the polished front wheels and aerodynamic bumper of a metallic blue supercar, then smoothly and continuously rises up and glides along the side profile toward the engine bay. 

The workshop environment has dark slate polished floors reflecting overhead LED ceiling light strips, industrial blue hydraulic lift posts, and neatly arranged German mechanic tool carts. A mechanic in a sleek black workshop uniform inspects the vehicle in the background with small natural movements. Lighting is moody, cinematic, and luxurious with crisp highlights gliding along the vehicle bodywork. 

One continuous uninterrupted shot with steady constant speed, no cuts, no jump transitions, 24fps, cinematic lighting.`,
};

export const CHAPTER_PROMPTS: GaragePrompt[] = [
  {
    id: 'ch1-entrance',
    chapter: '01 / Entrance & Rolling Door',
    title: 'Pintu Workshop Terbuka & Supercar Memasuki Bay',
    duration: '6–8 detik',
    cameraMovement: 'Slow steady forward push through the opening rolling door into the garage',
    promptText: `Cinematic 4K shot starting from outside looking into Berlin 188 Garage as the heavy industrial metal rolling shutter smoothly ascends. The camera glides forward through the entrance onto the glossy dark concrete floor. Inside the bright, sterile workshop, overhead linear LED lights illuminate a clean service bay with a Berlin Blue two-post vehicle lift and organized tool cabinets. Steady constant dolly forward, no cuts, photorealistic automotive commercial lighting.`,
    notes: 'Cocok untuk awal scroll saat user baru masuk halaman garasi.',
  },
  {
    id: 'ch2-diagnostics',
    chapter: '02 / OEM Diagnostic Station',
    title: 'Troli Scanner Komputer & Pembacaan Modul ECU',
    duration: '5–8 detik',
    cameraMovement: 'Slow lateral tracking shot across diagnostic workstation to vehicle front',
    promptText: `Slow smooth lateral camera track across a high-end European diagnostic computer cart with a glowing oscilloscope screen and OEM diagnostic interface cables neatly connected to the front of a supercar. Clean workshop environment, subtle reflections of green and blue digital waveform telemetry on dark metallic surfaces. Mechanics tool chest in background with clean focus falloff. One continuous steady take, photorealistic, 24fps.`,
    notes: 'Menonjolkan kecanggihan divisi komputer & elektrikal.',
  },
  {
    id: 'ch3-hydraulic-lift',
    chapter: '03 / Two-Post Hydraulic Lift',
    title: 'Lift Hidrolik Naik & Inspeksi Undercarriage',
    duration: '6–8 detik',
    cameraMovement: 'Low angle camera tracking upward synchronously as the vehicle is lifted',
    promptText: `Cinematic low-angle camera shot looking up as the dual-post Berlin Blue hydraulic car lift smoothly raises a sports car into the air. Chrome hydraulic cylinders extend smoothly with faint mechanical hum. The camera tilts slightly upward to reveal the clean underbody, exhaust system, and sport suspension linkages illuminated by warm portable work lamps below. One continuous take, smooth constant motion, pristine dark garage environment.`,
    notes: 'Kunci visual untuk fitur "Lift & Kolong".',
  },
  {
    id: 'ch4-engine-precision',
    chapter: '04 / Engine Bay & Turbocharging',
    title: 'Ruang Mesin Presisi & Overhaul Transmisi',
    duration: '5–8 detik',
    cameraMovement: 'Slow continuous macro orbit around the open engine bay',
    promptText: `Close-up cinematic 4K camera orbiting slowly around an open rear mid-engine bay of a high-performance supercar. Intricate carbon fiber air intake plenums, twin turbochargers, braided stainless fluid lines, and precision aluminum components are highlighted by focused overhead LED work lamps. A red engine crane and titanium hand tools sit nearby. Constant slow rotation, shallow depth of field, razor-sharp mechanical detail, no cuts.`,
    notes: 'Menunjukkan keahlian mekanikal dan overhaul berat.',
  },
  {
    id: 'ch5-nano-detailing',
    chapter: '05 / Finishing & Nano Ceramic',
    title: 'Inspeksi Kilau Nano Ceramic & Quality Control',
    duration: '6–8 detik',
    cameraMovement: 'Slow gliding pan along the mirror-finish fender and door panels',
    promptText: `Cinematic macro glide along the side door and rear haunches of the sports car. The paint has a mirror-like nano ceramic coating reflecting the overhead tubular LED studio lights in perfectly straight, unbroken lines. A specialist in black nitrile gloves slowly wipes a microfiber cloth with subtle, natural precision. Showroom quality control lighting, intense gloss, photorealistic 4K automotive finish.`,
    notes: 'Shot penutup untuk merangkum hasil kerja berkualitas tinggi.',
  },
];
