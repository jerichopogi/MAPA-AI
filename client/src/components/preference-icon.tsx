import { Camera, Drama, Landmark, Leaf, Moon, Mountain, ShoppingBag, UtensilsCrossed, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Camera,
  Drama,
  Landmark,
  Leaf,
  Moon,
  Mountain,
  ShoppingBag,
  UtensilsCrossed,
};

export function PreferenceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Landmark;
  return <Icon className={className} />;
}
