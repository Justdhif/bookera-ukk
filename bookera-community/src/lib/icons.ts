import {
  Book,
  BookOpen,
  BookMarked,
  Library,
  GraduationCap,
  Newspaper,
  FileText,
  Briefcase,
  Lightbulb,
  Brain,
  Code,
  Palette,
  Music,
  Microscope,
  Globe,
  Heart,
  Users,
  Sparkles,
  Star,
  Trophy,
  Rocket,
  Coffee,
  Camera,
  Gamepad,
  Plane,
  Leaf,
  Cat,
  Zap,
  Pizza,
  Smile,
  Compass,
  type LucideIcon,
} from "lucide-react";

export interface IconOption {
  name: string;
  icon: LucideIcon;
  label: string;
}

// List of icons relevant to book categories
export const AVAILABLE_ICONS: IconOption[] = [
  // Books & Education
  { name: "Book", icon: Book, label: "Book" },
  { name: "BookOpen", icon: BookOpen, label: "Open Book" },
  { name: "BookMarked", icon: BookMarked, label: "Bookmarked Book" },
  { name: "Library", icon: Library, label: "Library" },
  { name: "GraduationCap", icon: GraduationCap, label: "Graduation" },
  { name: "Newspaper", icon: Newspaper, label: "Newspaper" },
  { name: "FileText", icon: FileText, label: "Document" },

  // Profession & Business
  { name: "Briefcase", icon: Briefcase, label: "Briefcase" },
  { name: "Code", icon: Code, label: "Code" },
  { name: "Microscope", icon: Microscope, label: "Microscope" },

  // Creativity & Art
  { name: "Palette", icon: Palette, label: "Palette" },
  { name: "Music", icon: Music, label: "Music" },
  { name: "Camera", icon: Camera, label: "Camera" },

  // Inspiration & Motivation
  { name: "Lightbulb", icon: Lightbulb, label: "Lightbulb" },
  { name: "Brain", icon: Brain, label: "Brain" },
  { name: "Star", icon: Star, label: "Star" },
  { name: "Trophy", icon: Trophy, label: "Trophy" },
  { name: "Sparkles", icon: Sparkles, label: "Sparkles" },
  { name: "Rocket", icon: Rocket, label: "Rocket" },

  // Entertainment & Hobbies
  { name: "Gamepad", icon: Gamepad, label: "Game" },
  { name: "Coffee", icon: Coffee, label: "Coffee" },
  { name: "Pizza", icon: Pizza, label: "Pizza" },
  { name: "Smile", icon: Smile, label: "Smile" },

  // General
  { name: "Heart", icon: Heart, label: "Heart" },
  { name: "Users", icon: Users, label: "Users" },
  { name: "Globe", icon: Globe, label: "Globe" },
  { name: "Plane", icon: Plane, label: "Plane" },
  { name: "Leaf", icon: Leaf, label: "Leaf" },
  { name: "Cat", icon: Cat, label: "Cat" },
  { name: "Zap", icon: Zap, label: "Lightning" },
  { name: "Compass", icon: Compass, label: "Compass" },
];

// Helper function to get icon by name
export function getIconByName(name: string): LucideIcon | null {
  const iconOption = AVAILABLE_ICONS.find(
    (option) => option.name.toLowerCase() === name.toLowerCase(),
  );
  return iconOption ? iconOption.icon : null;
}
