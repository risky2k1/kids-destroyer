import {
  Beef,
  Beer,
  CakeSlice,
  ChefHat,
  Coffee,
  CookingPot,
  Croissant,
  CupSoda,
  Drumstick,
  EggFried,
  Fish,
  Flame,
  IceCreamCone,
  MapPin,
  Martini,
  Moon,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Sparkles,
  Store,
  Sun,
  Trees,
  Utensils,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from 'lucide-react';

export type PlaceIconDef = { key: string; label: string; Icon: LucideIcon };

export const PLACE_ICONS: PlaceIconDef[] = [
  { key: 'utensils', label: 'Quán ăn', Icon: Utensils },
  { key: 'utensils-crossed', label: 'Nhà hàng', Icon: UtensilsCrossed },
  { key: 'coffee', label: 'Cà phê', Icon: Coffee },
  { key: 'cup-soda', label: 'Trà sữa / Nước', Icon: CupSoda },
  { key: 'flame', label: 'Nướng', Icon: Flame },
  { key: 'soup', label: 'Bún / Phở / Mỳ', Icon: Soup },
  { key: 'cooking-pot', label: 'Lẩu', Icon: CookingPot },
  { key: 'egg-fried', label: 'Cơm', Icon: EggFried },
  { key: 'beef', label: 'Thịt bò / Bít tết', Icon: Beef },
  { key: 'drumstick', label: 'Gà', Icon: Drumstick },
  { key: 'fish', label: 'Hải sản', Icon: Fish },
  { key: 'pizza', label: 'Pizza', Icon: Pizza },
  { key: 'sandwich', label: 'Bánh mì', Icon: Sandwich },
  { key: 'croissant', label: 'Bánh ngọt / Sáng', Icon: Croissant },
  { key: 'cake-slice', label: 'Tráng miệng', Icon: CakeSlice },
  { key: 'ice-cream-cone', label: 'Kem / Chè', Icon: IceCreamCone },
  { key: 'salad', label: 'Healthy / Chay', Icon: Salad },
  { key: 'beer', label: 'Bia / Nhậu', Icon: Beer },
  { key: 'wine', label: 'Rượu / Bistro', Icon: Wine },
  { key: 'martini', label: 'Cocktail / Bar', Icon: Martini },
  { key: 'chef-hat', label: 'Đặc sản', Icon: ChefHat },
  { key: 'store', label: 'Vỉa hè / Quán nhỏ', Icon: Store },
  { key: 'sun', label: 'Quán sáng', Icon: Sun },
  { key: 'moon', label: 'Quán đêm', Icon: Moon },
  { key: 'trees', label: 'Sân vườn', Icon: Trees },
  { key: 'sparkles', label: 'Đặc biệt', Icon: Sparkles },
  { key: 'map-pin', label: 'Địa điểm', Icon: MapPin },
];

const ICON_MAP = new Map<string, LucideIcon>(PLACE_ICONS.map((d) => [d.key, d.Icon]));

export const PLACE_ICON_KEYS = PLACE_ICONS.map((d) => d.key);

export function getPlaceIcon(key: string | null | undefined): LucideIcon | null {
  if (!key) return null;
  return ICON_MAP.get(key) ?? null;
}
