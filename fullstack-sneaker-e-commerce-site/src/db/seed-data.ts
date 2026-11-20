export const SIZES = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"];

type SeedProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  colorway: string;
  description: string;
  priceCents: number;
  compareAtCents?: number;
  image: string;
  featured?: boolean;
  isNew?: boolean;
  /** sizes that are sold out */
  soldOut?: string[];
};

export const seedProducts: SeedProduct[] = [
  {
    slug: "aero-runner",
    name: "Aero Runner 2",
    brand: "Aerolite",
    category: "Running",
    colorway: "White / Volt",
    description:
      "A featherweight daily trainer with a responsive foam midsole and breathable engineered mesh. Built to eat miles from easy jogs to tempo days.",
    priceCents: 13500,
    image: "/images/aero-runner.jpg",
    featured: true,
    isNew: true,
  },
  {
    slug: "vortex-pulse",
    name: "Vortex Pulse",
    brand: "Aerolite",
    category: "Running",
    colorway: "Black / Signal Red",
    description:
      "Race-day energy return meets all-day comfort. A rocker geometry and sock-like fit keep you rolling forward.",
    priceCents: 15500,
    compareAtCents: 18000,
    image: "/images/vortex-pulse.jpg",
    featured: true,
    soldOut: ["7", "12"],
  },
  {
    slug: "court-legend",
    name: "Court Legend High",
    brand: "Hoopline",
    category: "Basketball",
    colorway: "University Red / White",
    description:
      "Premium full-grain leather high-top with a cushioned heel unit and a herringbone outsole for locked-in traction on the hardwood.",
    priceCents: 17000,
    image: "/images/court-legend.jpg",
    featured: true,
  },
  {
    slug: "midnight-dunk",
    name: "Midnight Dunk Mid",
    brand: "Hoopline",
    category: "Basketball",
    colorway: "Black / Violet",
    description:
      "A mid-top silhouette with a padded collar and bold violet overlays. Court-ready, street-approved.",
    priceCents: 14500,
    image: "/images/midnight-dunk.jpg",
    isNew: true,
  },
  {
    slug: "skyline-low",
    name: "Skyline Low",
    brand: "Urbanform",
    category: "Lifestyle",
    colorway: "Cream / Gum",
    description:
      "Minimal, tumbled-leather court sneaker on a warm gum cupsole. The easiest pair to wear with everything.",
    priceCents: 11000,
    image: "/images/skyline-low.jpg",
    featured: true,
  },
  {
    slug: "nimbus-cloud",
    name: "Nimbus Cloud",
    brand: "Urbanform",
    category: "Lifestyle",
    colorway: "Triple White",
    description:
      "A chunky layered platform with plush cushioning and clean, all-white leather and suede panels.",
    priceCents: 12500,
    compareAtCents: 14000,
    image: "/images/nimbus-cloud.jpg",
    soldOut: ["8.5"],
  },
  {
    slug: "street-grid",
    name: "Street Grid Pro",
    brand: "Northbound",
    category: "Skate",
    colorway: "Navy / Slate",
    description:
      "Durable suede upper, double-stitched ollie zones and a padded tongue for board feel with serious impact protection.",
    priceCents: 9500,
    image: "/images/street-grid.jpg",
  },
  {
    slug: "terra-trail",
    name: "Terra Trail GTX",
    brand: "Northbound",
    category: "Trail",
    colorway: "Olive / Burnt Orange",
    description:
      "Aggressive 5mm lugs, a rock plate and a water-resistant upper. Take it off-road and keep going.",
    priceCents: 16500,
    image: "/images/terra-trail.jpg",
    isNew: true,
  },
];
