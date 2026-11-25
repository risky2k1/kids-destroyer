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
} from 'lucide-react';
import type { Tag } from '../lib/types';

type Props = {
  tag: Pick<Tag, 'icon' | 'emoji'> | null | undefined;
  className?: string;
  fallbackPin?: boolean;
};

function renderLucideIcon(key: string | null | undefined, className: string) {
  switch (key) {
    case 'utensils':
      return <Utensils className={className} aria-hidden />;
    case 'utensils-crossed':
      return <UtensilsCrossed className={className} aria-hidden />;
    case 'coffee':
      return <Coffee className={className} aria-hidden />;
    case 'cup-soda':
      return <CupSoda className={className} aria-hidden />;
    case 'flame':
      return <Flame className={className} aria-hidden />;
    case 'soup':
      return <Soup className={className} aria-hidden />;
    case 'cooking-pot':
      return <CookingPot className={className} aria-hidden />;
    case 'egg-fried':
      return <EggFried className={className} aria-hidden />;
    case 'beef':
      return <Beef className={className} aria-hidden />;
    case 'drumstick':
      return <Drumstick className={className} aria-hidden />;
    case 'fish':
      return <Fish className={className} aria-hidden />;
    case 'pizza':
      return <Pizza className={className} aria-hidden />;
    case 'sandwich':
      return <Sandwich className={className} aria-hidden />;
    case 'croissant':
      return <Croissant className={className} aria-hidden />;
    case 'cake-slice':
      return <CakeSlice className={className} aria-hidden />;
    case 'ice-cream-cone':
      return <IceCreamCone className={className} aria-hidden />;
    case 'salad':
      return <Salad className={className} aria-hidden />;
    case 'beer':
      return <Beer className={className} aria-hidden />;
    case 'wine':
      return <Wine className={className} aria-hidden />;
    case 'martini':
      return <Martini className={className} aria-hidden />;
    case 'chef-hat':
      return <ChefHat className={className} aria-hidden />;
    case 'store':
      return <Store className={className} aria-hidden />;
    case 'sun':
      return <Sun className={className} aria-hidden />;
    case 'moon':
      return <Moon className={className} aria-hidden />;
    case 'trees':
      return <Trees className={className} aria-hidden />;
    case 'sparkles':
      return <Sparkles className={className} aria-hidden />;
    case 'map-pin':
      return <MapPin className={className} aria-hidden />;
    default:
      return null;
  }
}

/** Renders a tag's Lucide icon if present, otherwise its legacy emoji, otherwise optional MapPin. */
export function TagIcon({ tag, className = 'size-4 shrink-0', fallbackPin = false }: Props) {
  const iconEl = renderLucideIcon(tag?.icon, className);
  if (iconEl) return iconEl;
  if (tag?.emoji) return <span aria-hidden>{tag.emoji}</span>;
  if (fallbackPin) return <MapPin className={className} aria-hidden />;
  return null;
}
