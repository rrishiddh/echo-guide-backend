
export const TOUR_CATEGORIES = {
  FOOD: "Food",
  ART: "Art",
  ADVENTURE: "Adventure",
  HISTORY: "History",
  CULTURE: "Culture",
  NIGHTLIFE: "Nightlife",
  SHOPPING: "Shopping",
  NATURE: "Nature",
  PHOTOGRAPHY: "Photography",
  SPORTS: "Sports",
  WELLNESS: "Wellness",
  FAMILY: "Family",
} as const;


export type TourCategory = (typeof TOUR_CATEGORIES)[keyof typeof TOUR_CATEGORIES];


export const TOUR_CATEGORY_DESCRIPTIONS = {
  [TOUR_CATEGORIES.FOOD]: "Culinary experiences, food tours, cooking classes, local cuisine",
  [TOUR_CATEGORIES.ART]: "Art galleries, museums, street art tours, cultural exhibitions",
  [TOUR_CATEGORIES.ADVENTURE]: "Hiking, climbing, extreme sports, outdoor activities",
  [TOUR_CATEGORIES.HISTORY]: "Historical sites, monuments, heritage tours, archaeological sites",
  [TOUR_CATEGORIES.CULTURE]: "Cultural experiences, traditions, local customs, festivals",
  [TOUR_CATEGORIES.NIGHTLIFE]: "Bars, clubs, night tours, entertainment venues",
  [TOUR_CATEGORIES.SHOPPING]: "Markets, boutiques, shopping districts, local crafts",
  [TOUR_CATEGORIES.NATURE]: "Wildlife, national parks, nature walks, eco-tours",
  [TOUR_CATEGORIES.PHOTOGRAPHY]: "Photo tours, scenic spots, landscape photography",
  [TOUR_CATEGORIES.SPORTS]: "Sporting events, stadiums, sports activities",
  [TOUR_CATEGORIES.WELLNESS]: "Yoga, meditation, spa tours, wellness retreats",
  [TOUR_CATEGORIES.FAMILY]: "Family-friendly activities, kid-friendly tours",
} as const;


export const TOUR_CATEGORY_ICONS = {
  [TOUR_CATEGORIES.FOOD]: "🍽️",
  [TOUR_CATEGORIES.ART]: "🎨",
  [TOUR_CATEGORIES.ADVENTURE]: "🏔️",
  [TOUR_CATEGORIES.HISTORY]: "🏛️",
  [TOUR_CATEGORIES.CULTURE]: "🎭",
  [TOUR_CATEGORIES.NIGHTLIFE]: "🌃",
  [TOUR_CATEGORIES.SHOPPING]: "🛍️",
  [TOUR_CATEGORIES.NATURE]: "🌿",
  [TOUR_CATEGORIES.PHOTOGRAPHY]: "📸",
  [TOUR_CATEGORIES.SPORTS]: "⚽",
  [TOUR_CATEGORIES.WELLNESS]: "🧘",
  [TOUR_CATEGORIES.FAMILY]: "👨‍👩‍👧‍👦",
} as const;


export const TOUR_CATEGORY_COLORS = {
  [TOUR_CATEGORIES.FOOD]: "#FF6B6B",
  [TOUR_CATEGORIES.ART]: "#9B59B6",
  [TOUR_CATEGORIES.ADVENTURE]: "#E67E22",
  [TOUR_CATEGORIES.HISTORY]: "#8B4513",
  [TOUR_CATEGORIES.CULTURE]: "#3498DB",
  [TOUR_CATEGORIES.NIGHTLIFE]: "#2C3E50",
  [TOUR_CATEGORIES.SHOPPING]: "#E91E63",
  [TOUR_CATEGORIES.NATURE]: "#27AE60",
  [TOUR_CATEGORIES.PHOTOGRAPHY]: "#34495E",
  [TOUR_CATEGORIES.SPORTS]: "#F39C12",
  [TOUR_CATEGORIES.WELLNESS]: "#1ABC9C",
  [TOUR_CATEGORIES.FAMILY]: "#F1C40F",
} as const;


export const getAllCategories = (): TourCategory[] => {
  return Object.values(TOUR_CATEGORIES);
};


export const getCategoryDescription = (category: TourCategory): string => {
  return TOUR_CATEGORY_DESCRIPTIONS[category] || "";
};


export const getCategoryIcon = (category: TourCategory): string => {
  return TOUR_CATEGORY_ICONS[category] || "📍";
};


export const getCategoryColor = (category: TourCategory): string => {
  return TOUR_CATEGORY_COLORS[category] || "#95A5A6";
};


export const isValidCategory = (value: string): value is TourCategory => {
  return Object.values(TOUR_CATEGORIES).includes(value as TourCategory);
};


export const POPULAR_CATEGORIES = [
  TOUR_CATEGORIES.FOOD,
  TOUR_CATEGORIES.HISTORY,
  TOUR_CATEGORIES.CULTURE,
  TOUR_CATEGORIES.ADVENTURE,
  TOUR_CATEGORIES.NATURE,
  TOUR_CATEGORIES.PHOTOGRAPHY,
] as const;