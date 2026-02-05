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

// Daftar icon yang relevan untuk kategori buku
export const AVAILABLE_ICONS: IconOption[] = [
  // Buku & Pendidikan
  { name: "Book", icon: Book, label: "Buku" },
  { name: "BookOpen", icon: BookOpen, label: "Buku Terbuka" },
  { name: "BookMarked", icon: BookMarked, label: "Buku Bookmark" },
  { name: "Library", icon: Library, label: "Perpustakaan" },
  { name: "GraduationCap", icon: GraduationCap, label: "Wisuda" },
  { name: "Newspaper", icon: Newspaper, label: "Koran" },
  { name: "FileText", icon: FileText, label: "Dokumen" },
  
  // Profesi & Bisnis
  { name: "Briefcase", icon: Briefcase, label: "Tas Kerja" },
  { name: "Code", icon: Code, label: "Kode" },
  { name: "Microscope", icon: Microscope, label: "Mikroskop" },
  
  // Kreativitas & Seni
  { name: "Palette", icon: Palette, label: "Palet" },
  { name: "Music", icon: Music, label: "Musik" },
  { name: "Camera", icon: Camera, label: "Kamera" },
  
  // Inspirasi & Motivasi
  { name: "Lightbulb", icon: Lightbulb, label: "Lampu" },
  { name: "Brain", icon: Brain, label: "Otak" },
  { name: "Star", icon: Star, label: "Bintang" },
  { name: "Trophy", icon: Trophy, label: "Piala" },
  { name: "Sparkles", icon: Sparkles, label: "Kilau" },
  { name: "Rocket", icon: Rocket, label: "Roket" },
  
  // Hiburan & Hobi
  { name: "Gamepad", icon: Gamepad, label: "Game" },
  { name: "Coffee", icon: Coffee, label: "Kopi" },
  { name: "Pizza", icon: Pizza, label: "Pizza" },
  { name: "Smile", icon: Smile, label: "Senyum" },
  
  // Umum
  { name: "Heart", icon: Heart, label: "Hati" },
  { name: "Users", icon: Users, label: "Orang" },
  { name: "Globe", icon: Globe, label: "Dunia" },
  { name: "Plane", icon: Plane, label: "Pesawat" },
  { name: "Leaf", icon: Leaf, label: "Daun" },
  { name: "Cat", icon: Cat, label: "Kucing" },
  { name: "Zap", icon: Zap, label: "Petir" },
  { name: "Compass", icon: Compass, label: "Kompas" },
];

// Helper function untuk mendapatkan icon berdasarkan nama
export function getIconByName(name: string): LucideIcon | null {
  const iconOption = AVAILABLE_ICONS.find(
    (option) => option.name.toLowerCase() === name.toLowerCase()
  );
  return iconOption ? iconOption.icon : null;
}
