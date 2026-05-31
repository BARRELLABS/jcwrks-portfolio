// Jacob's tools & gear — shown in the "My Tools" grid on the About page.
// `icon` is a brand-style logo / mark in /public/tools/.
export interface Tool {
  name: string;
  blurb: string;
  icon: string;
}

// Gear: the camera body + lenses he actually shoots on.
export const gear: Tool[] = [
  { name: "Canon EOS R6 Mark II", blurb: "My main body — fast, sharp, built for action.", icon: "/tools/canon.svg" },
  { name: "70–200mm f/2.8", blurb: "The reach lens for sideline sports.", icon: "/tools/lens.svg" },
  { name: "24–70mm f/2.8", blurb: "My all-rounder for portraits and events.", icon: "/tools/lens.svg" },
  { name: "85mm f/1.8", blurb: "Creamy bokeh for portraits.", icon: "/tools/lens.svg" },
];

// Software: how the shots get finished.
export const software: Tool[] = [
  { name: "Adobe Lightroom Classic", blurb: "Editing and color grading.", icon: "/tools/lightroom.svg" },
  { name: "Adobe Photoshop", blurb: "Where the graphics come together.", icon: "/tools/photoshop.svg" },
  { name: "Adobe Premiere Pro", blurb: "Cutting reels and video.", icon: "/tools/premiere.svg" },
  { name: "Milanote", blurb: "Planning shoots and moodboards.", icon: "/tools/milanote.svg" },
];

// kept for backwards-compat with any old import
export const tools: Tool[] = [...gear, ...software];
