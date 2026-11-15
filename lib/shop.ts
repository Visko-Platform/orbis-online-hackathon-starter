// Fictional demo storefront for directed Lifecast stories. All brands are invented.
/** Public base URL of this app (used in storefront JSON-LD and story replays). */
export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export type ShopItem = {
  id: string;
  kind: "apparel" | "travel" | "home";
  brand: string;
  name: string;
  price?: string;
  image: string;
  alt?: string[];
  description: string;
  bullets: string[];
  crumbs: string;
  rating?: number;
  reviews?: number;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  sections?: { title: string; items: string[] }[];
  related?: string[];
  home?: { address: string; beds: number; baths: number; sqft: number; chips: string[] };
};

export type Brand = { logo: string; promo: string; nav: string[]; theme: string; footer: string };
export const BRANDS: Record<string, Brand> = {
  "Summit Supply Co.": { logo: "SUMMIT SUPPLY CO.", promo: "Free shipping over $99 · 60-day returns · Members earn 10% back", nav: ["Snowboard", "Ski", "Outerwear", "Climb", "Camp", "Sale"], theme: "t-summit", footer: "Outfitting mountain people since 1987." },
  "Saltline Surf Co.": { logo: "saltline surf co.", promo: "Free board shipping in the lower 48 · Surf report updated every hour", nav: ["Surfboards", "Wetsuits", "Fins & Leashes", "Apparel", "Journal"], theme: "t-saltline", footer: "Shaped and tested on cold northern beaches." },
  "Fold & Field": { logo: "FOLD & FIELD", promo: "Complimentary shipping & returns · Alterations in store", nav: ["New In", "Coats", "Knitwear", "Tailoring", "Shoes", "Journal"], theme: "t-fold", footer: "Considered clothing, made to last." },
  "Powder Peak Resort": { logo: "POWDER PEAK", promo: "18\" new snow in 24 hrs · Gondola & 9 lifts spinning · Book 7+ days ahead and save 25%", nav: ["Lift Tickets", "Lodging", "Lessons", "Mountain Info", "Village"], theme: "t-peak", footer: "Powder Peak Resort · Elevation 8,200–11,600 ft" },
  "Swell Bay": { logo: "SWELL BAY", promo: "Surf 4–5 ft · Offshore winds until noon · Water 61°F", nav: ["Surf Report", "Stay", "Lessons", "Eat & Drink", "Events"], theme: "t-swell", footer: "Swell Bay Visitors Bureau" },
  "Northline Motors": { logo: "NORTHLINE", promo: "0.9% APR for 36 months on select models · Free home test drives", nav: ["New Inventory", "Certified Used", "Electric", "Finance", "Service"], theme: "t-motors", footer: "Northline Motors · Harbor District Showroom" },
  "Harbor & Main Realty": { logo: "Harbor & Main", promo: "", nav: ["Buy", "Rent", "Sell", "Home Loans", "Find an Agent"], theme: "t-realty", footer: "Harbor & Main Realty · Equal Housing Opportunity" },
};
export const brandOf = (name: string) => BRANDS[name] ?? BRANDS["Summit Supply Co."];

export const PRODUCTS: ShopItem[] = [
  {
    id: "glacier-jacket", kind: "apparel", brand: "Summit Supply Co.", name: "Glacier Teal Insulated Snowboard Jacket", price: "289.95",
    image: "/assets/jacket-glacier.jpg", alt: ["/assets/jacket-sunset.jpg", "/assets/jacket-camo.jpg"], crumbs: "Snowboard · Outerwear · Jackets",
    description: "20K waterproof, 80g insulated snowboard jacket in glacier teal with a white zipper, color-block chest stripe, powder skirt and helmet-compatible hood.",
    bullets: ["20K/20K waterproof breathable shell", "80g insulation, powder skirt, pit zips", "Helmet-compatible hood, goggle pocket"],
    rating: 4.7, reviews: 312, sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Glacier Teal", hex: "#1f6f78" }, { name: "Sunset", hex: "#e8682f" }, { name: "Arctic Camo", hex: "#d9dde0" }],
    sections: [
      { title: "Features", items: ["Fully taped seams", "Powder skirt with gripper elastic", "Underarm vents", "Lift-pass pocket on sleeve", "Recco reflector"] },
      { title: "Materials & care", items: ["Shell: 100% recycled polyester, PFC-free DWR", "Insulation: 80g body / 60g sleeves", "Machine wash cold, tumble dry low"] },
      { title: "Fit", items: ["Relaxed fit, hip length", "Model is 5'9\" wearing size S"] },
    ],
    related: ["tidal-wetsuit", "camel-trench", "seafoam-egg"],
  },
  {
    id: "tidal-wetsuit", kind: "apparel", brand: "Saltline Surf Co.", name: "Tidal 4/3mm Chest-Zip Wetsuit", price: "349.00",
    image: "/assets/wetsuit-black.jpg", crumbs: "Surf · Wetsuits · Full suits",
    description: "Black and charcoal 4/3mm full-length surf wetsuit with a chest zip and teal stitched seams, for cold-water sessions.",
    bullets: ["4/3mm limestone neoprene", "Chest-zip entry, sealed seams", "Thermal lining in the torso"],
    rating: 4.8, reviews: 186, sizes: ["XS", "S", "MS", "M", "MT", "L", "XL"],
    colors: [{ name: "Black / Teal", hex: "#111" }],
    sections: [
      { title: "Warmth guide", items: ["Water 52–62°F", "Pairs with 3mm booties below 55°F"] },
      { title: "Construction", items: ["Glued & blind-stitched, liquid-taped stress points", "Quick-dry thermal lining", "Seamless underarm panels"] },
    ],
    related: ["seafoam-egg", "glacier-jacket", "camel-trench"],
  },
  {
    id: "seafoam-egg", kind: "apparel", brand: "Saltline Surf Co.", name: "Seafoam Retro Egg Surfboard 7'0\"", price: "689.00",
    image: "/assets/surfboard-retro.jpg", crumbs: "Surf · Surfboards · Mid-length",
    description: "7 ft retro egg surfboard with a cream deck, seafoam green rail band and a single fin: easy paddling and long glides.",
    bullets: ["7'0\" x 21 3/4\" x 2 3/4\"", "PU/PE glassed, single fin box", "Great for small to medium waves"],
    rating: 4.9, reviews: 74, sizes: ["6'6\"", "7'0\"", "7'6\""],
    colors: [{ name: "Seafoam rail", hex: "#7fc9b5" }, { name: "Sand", hex: "#e6d8b8" }],
    sections: [
      { title: "Dimensions", items: ["7'0\" x 21 3/4\" x 2 3/4\"", "Volume 46.5 L", "Single fin, 7.5\" included"] },
      { title: "Shaper notes", items: ["Wide nose for early entry", "Soft rails, flat rocker", "Hand-glassed 6+4 oz"] },
    ],
    related: ["tidal-wetsuit", "glacier-jacket", "camel-trench"],
  },
  {
    id: "camel-trench", kind: "apparel", brand: "Fold & Field", name: "Camel Wool Belted Trench Coat", price: "420.00",
    image: "/assets/trench-coat.jpg", crumbs: "Women & Men · Coats · Trench",
    description: "Long camel wool trench coat with a belt, storm flap and horn buttons, a city staple from office to night out.",
    bullets: ["Italian wool blend", "Belted waist, storm flap", "Fully lined, knee length"],
    rating: 4.6, reviews: 98, sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Camel", hex: "#c19a6b" }, { name: "Charcoal", hex: "#3a3a3a" }, { name: "Ink", hex: "#1c2433" }],
    sections: [
      { title: "Composition", items: ["80% wool, 20% polyamide", "Lining: 100% cupro", "Horn buttons"] },
      { title: "Fit & care", items: ["Relaxed through the body, knee length", "Dry clean only"] },
    ],
    related: ["glacier-jacket", "tidal-wetsuit", "seafoam-egg"],
  },
];

export const STAYS: ShopItem[] = [
  {
    id: "powder-peak", kind: "travel", brand: "Powder Peak Resort", name: "Powder Peak Resort", image: "/assets/resort-powder-peak.jpg",
    crumbs: "Lift Tickets · Lodging · Trail Map · Snow Report",
    description: "Ski and snowboard resort with 3,400 vertical feet, a red base-to-summit gondola, 112 runs, terrain parks and a timber base village. 18 inches of fresh powder overnight.",
    bullets: ["1-day lift ticket from $139", "Ski-in lodging from $249/night", "Gondola running · 112 runs open"],
  },
  {
    id: "swell-bay", kind: "travel", brand: "Swell Bay", name: "Swell Bay Surf Town", image: "/assets/stay-swell-bay.jpg",
    crumbs: "Surf Report · Beach Stays · Board Rentals",
    description: "Small surf town on a crescent beach with clean peeling waves, surf shacks and a wooden boardwalk. Today: 4-5 ft, offshore winds, golden evening glass-off.",
    bullets: ["Beach cottages from $189/night", "Surf lessons & board rentals", "Surf report: 4-5 ft, offshore"],
  },
];

export const HOMES: ShopItem[] = [
  {
    id: "downtown-loft", kind: "home", brand: "Harbor & Main Realty", name: "Downtown Brick Loft · 2 bd · 2 ba · 1,480 sqft", price: "895000",
    image: "/assets/home-downtown-loft.jpg", alt: ["/assets/home-loft-kitchen.jpg", "/assets/home-loft-bedroom.jpg"], crumbs: "For sale · Lofts · Downtown",
    description: "Converted warehouse loft with exposed brick, tall steel-framed windows, polished concrete floors, timber beams, and an open kitchen with island. Garage parking with EV charger.",
    bullets: ["2 beds · 2 baths · 1,480 sqft", "14 ft ceilings, steel windows", "Garage parking + EV charger, HOA $540/mo"],
    home: { address: "410 Harbor St #5B, Downtown Harbor District", beds: 2, baths: 2, sqft: 1480, chips: ["Condo/loft", "Built 1912 (converted 2019)", "HOA $540/mo", "Garage + EV charger", "$605/sqft", "Listed 3 days ago"] },
  },
  {
    id: "alpine-chalet", kind: "home", brand: "Harbor & Main Realty", name: "Powder Peak Alpine Chalet · 4 bd · 3 ba · 2,850 sqft", price: "1450000",
    image: "/assets/home-alpine-chalet.jpg", alt: ["/assets/home-chalet-kitchen.jpg", "/assets/home-chalet-bedroom.jpg"], crumbs: "For sale · Mountain homes · Powder Peak",
    description: "Modern timber chalet a short drive from the Powder Peak gondola: a double-height great room with a stone fireplace, walnut kitchen with a stone island, and a ski room with boot warmers.",
    bullets: ["4 beds · 3 baths · 2,850 sqft", "Stone fireplace, timber beams", "Ski room + heated 2-car garage"],
    home: { address: "18 Gondola Ridge Rd, Powder Peak", beds: 4, baths: 3, sqft: 2850, chips: ["Single family", "Built 2021", "Ski room", "Heated garage", "5 min to gondola", "Listed today"] },
  },
];

export type Car = { id: string; name: string; price: string; image: string; tagline: string; specs: string[]; description: string; body: string };
export const CARS: Car[] = [
  {
    id: "trailhead-suv", name: "Northline Trailhead AWD SUV", price: "38990", image: "/assets/car-suv.jpg",
    tagline: "All-wheel drive, snow mode, roof rails ready for boards.",
    specs: ["AWD with snow mode", "Roof rails + crossbars", "Heated seats & wheel", "28 mpg", "8.6 in ground clearance"],
    description: "Mid-size all-wheel-drive SUV in silver with roof rails, snow drive mode, heated seats, and room for four boards.", body: "SUV",
  },
  {
    id: "volt-gt", name: "Northline Volt GT Coupe", price: "52990", image: "/assets/car-coupe.jpg",
    tagline: "Electric sports coupe, 0-60 in 3.9 s.",
    specs: ["Dual-motor EV", "310 mi range", "0-60 mph 3.9 s", "Glass roof"],
    description: "Dark blue dual-motor electric sports coupe with a glass roof.", body: "Coupe",
  },
  {
    id: "ridge-pickup", name: "Northline Ridge 4x4 Pickup", price: "44500", image: "/assets/car-pickup.jpg",
    tagline: "4x4 pickup with a 6 ft bed for gear and gravel roads.",
    specs: ["4x4 with locking diff", "6 ft bed", "Tow 7,500 lb", "Skid plates"],
    description: "Dark green 4x4 pickup truck with skid plates and a 6 ft bed.", body: "Pickup Truck",
  },
];

export type Story = { id: string; name: string; emoji: string; persona: string; pitch: string; steps: { href: string; label: string; hint: string; try?: boolean }[] };
export const STORIES: Story[] = [
  {
    id: "powder", name: "Powder Day", emoji: "🏂", persona: "Weekend snowboarder",
    pitch: "From that ski jacket to your dream house: jacket → resort → AWD SUV → mountain chalet. Drive up, ride, then walk through your dream house.",
    steps: [
      { href: "/shop/p/glacier-jacket", label: "Jacket", hint: "Lifecast icon → Try this page: you in the jacket on the mountain.", try: true },
      { href: "/shop/stay/powder-peak", label: "Resort", hint: "Browse the resort: Lifecast remembers where you want to go." },
      { href: "/shop/cars", label: "Cars", hint: "Browse a couple of cars." },
      { href: "/shop/cars/trailhead-suv", label: "SUV", hint: "Try this page: the road trip to Powder Peak, starring you.", try: true },
      { href: "/shop/homes/alpine-chalet", label: "Chalet", hint: "Finish with a house: walk through the chalet near the slopes and move the furniture.", try: true },
    ],
  },
  {
    id: "surf", name: "Surf Escape", emoji: "🏄", persona: "Cold-water surfer",
    pitch: "Wetsuit + surfboard → surf town → 4x4 pickup. Ends: load the board, drive the coast, paddle out, surf.",
    steps: [
      { href: "/shop/p/tidal-wetsuit", label: "Wetsuit", hint: "Try this page: you in the wetsuit on the beach.", try: true },
      { href: "/shop/p/seafoam-egg", label: "Surfboard", hint: "Browse the board (Try it to add it to your wardrobe).", try: true },
      { href: "/shop/stay/swell-bay", label: "Surf town", hint: "Browse Swell Bay: your destination." },
      { href: "/shop/cars", label: "Cars", hint: "Browse a couple of cars." },
      { href: "/shop/cars/ridge-pickup", label: "Pickup", hint: "Try this page: the surf trip, starring you.", try: true },
    ],
  },
  {
    id: "city", name: "City Move", emoji: "🏙", persona: "Professional moving downtown",
    pitch: "Trench coat → downtown loft → electric coupe. Ends: drive home through the city at night and walk into your new loft.",
    steps: [
      { href: "/shop/p/camel-trench", label: "Trench", hint: "Try this page: you in the trench coat downtown.", try: true },
      { href: "/shop/homes/downtown-loft", label: "Loft", hint: "Try it: walk through and rearrange your future loft.", try: true },
      { href: "/shop/cars", label: "Cars", hint: "Browse a couple of cars." },
      { href: "/shop/cars/volt-gt", label: "EV coupe", hint: "Try this page: the drive home to your new loft.", try: true },
    ],
  },
];

export const getStory = (id?: string) => STORIES.find((s) => s.id === id) ?? STORIES[0];
export const withStory = (href: string, story: string) => `${href}?story=${story}`;
