"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  User as UserIcon,
  Camera,
  MapPin,
  Phone,
  Briefcase,
  Building2,
  CreditCard,
  Calendar,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const inputClassName =
  "h-12 px-4 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";

const labelClassName =
  "text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2";

export default function SetupProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [occupation, setOccupation] = useState("");
  const [institution, setInstitution] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Avatar size must be less than 2MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      if (gender) formData.append("gender", gender);
      if (birthDate) formData.append("birth_date", birthDate);
      if (phoneNumber) formData.append("phone_number", phoneNumber);
      if (address) formData.append("address", address);
      if (bio) formData.append("bio", bio);
      if (identificationNumber) formData.append("identification_number", identificationNumber);
      if (occupation) formData.append("occupation", occupation);
      if (institution) formData.append("institution", institution);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await authService.setupProfile(formData);
      setUser(res.data.data.user);
      toast.success("Profile created successfully!");
      router.push("/");
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.data && typeof errorData.data === "object") {
        const errors = Object.values(errorData.data).flat();
        errors.forEach((error: any) => toast.error(error));
      } else {
        toast.error(errorData?.message ?? "Failed to create profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 25 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-brand-primary/10 via-white to-brand-primary-light/5 dark:from-brand-primary/5 dark:via-gray-950 dark:to-brand-primary-dark/10 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-primary-dark/5 dark:bg-brand-primary-dark/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/3 dark:bg-brand-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-4xl"
      >
        <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
          <div className="h-1.5 bg-linear-to-r from-brand-primary via-brand-primary-light to-brand-primary-dark" />

          <CardHeader className="space-y-4 text-center pb-2 pt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              className="flex items-center justify-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-lg shadow-brand-primary/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors mt-2">
                One more step! Fill in your details to start using Bookera
              </CardDescription>
              {user?.email && (
                <p className="text-sm text-brand-primary font-medium mt-2">{user.email}</p>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <form onSubmit={handleSubmit}>
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <div
                      className="w-24 h-24 rounded-full border-4 border-brand-primary/20 dark:border-brand-primary/30 overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer transition-all duration-300 group-hover:border-brand-primary/50 group-hover:shadow-lg group-hover:shadow-brand-primary/20"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarPreview ? (
                        <Image src={avatarPreview} alt="Avatar preview" width={96} height={96} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md hover:bg-brand-primary-dark transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleAvatarChange} className="hidden" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Click to upload photo (optional, max 2MB)</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className={labelClassName}>
                        <UserIcon className="w-4 h-4" />
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input id="full-name" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClassName} disabled={loading} />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className={labelClassName}>
                        <UserIcon className="w-4 h-4" />
                        Gender
                      </label>
                      <Select value={gender} onValueChange={setGender} disabled={loading}>
                        <SelectTrigger className="h-12 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className={labelClassName}>
                        <Calendar className="w-4 h-4" />
                        Date of Birth
                      </label>
                      <Input id="birth-date" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClassName} disabled={loading} />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className={labelClassName}>
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </label>
                      <Input id="phone-number" placeholder="08123456789" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClassName} disabled={loading} />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className={labelClassName}>
                        <CreditCard className="w-4 h-4" />
                        NISN/NIP/NIK
                      </label>
                      <Input id="identification-number" placeholder="Identification number" value={identificationNumber} onChange={(e) => setIdentificationNumber(e.target.value)} className={inputClassName} disabled={loading} />
                    </motion.div>
                  </div>

                  <div className="space-y-5">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className={labelClassName}>
                        <Briefcase className="w-4 h-4" />
                        Occupation
                      </label>
                      <Input id="occupation" placeholder="Student, Teacher, etc." value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputClassName} disabled={loading} />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className={labelClassName}>
                        <Building2 className="w-4 h-4" />
                        Institution
                      </label>
                      <Input id="institution" placeholder="School or organization name" value={institution} onChange={(e) => setInstitution(e.target.value)} className={inputClassName} disabled={loading} />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className={labelClassName}>
                        <MapPin className="w-4 h-4" />
                        Address
                      </label>
                      <Textarea
                        id="address"
                        placeholder="Enter your full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                        className="px-4 py-3 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 resize-none"
                        disabled={loading}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className={labelClassName}>
                        <Sparkles className="w-4 h-4" />
                        Bio
                      </label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us a little about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="px-4 py-3 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 resize-none"
                        disabled={loading}
                      />
                    </motion.div>
                  </div>
                </div>

                <motion.div variants={itemVariants} className="pt-2">
                  <Button
                    type="submit"
                    variant="submit"
                    loading={loading}
                    className="w-full h-12 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
                    spinnerClassName="text-white"
                  >
                    {loading ? "Saving..." : (<>Save & Start Exploring<ArrowRight className="w-5 h-5 ml-2" /></>)}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
