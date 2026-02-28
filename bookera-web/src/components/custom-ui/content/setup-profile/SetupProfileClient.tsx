"use client";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { AnimatePresence, motion } from "framer-motion";
import { User, Camera, Briefcase, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import SetupStepIndicator from "./SetupStepIndicator";
import SetupStepPersonal from "./SetupStepPersonal";
import SetupStepProfessional from "./SetupStepProfessional";
import SetupStepAvatar from "./SetupStepAvatar";

export type SetupStep = "personal" | "professional" | "avatar";

export const SETUP_STEPS = [
  { key: "personal" as SetupStep, label: "Personal Info", icon: User },
  { key: "professional" as SetupStep, label: "Professional", icon: Briefcase },
  { key: "avatar" as SetupStep, label: "Avatar", icon: Camera },
];

export const cardVariants = {
  enter: { x: 60, opacity: 0, scale: 0.96 },
  center: { x: 0, opacity: 1, scale: 1 },
  exit: { x: -60, opacity: 0, scale: 0.96 },
};

export const cardTransition = {
  x: { type: "spring" as const, stiffness: 350, damping: 30 },
  opacity: { duration: 0.25 },
  scale: { duration: 0.25 },
};

export default function SetupProfileClient() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState<SetupStep>("personal");
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [occupation, setOccupation] = useState("");
  const [institution, setInstitution] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | string | null>(null);

  const currentStepIndex = SETUP_STEPS.findIndex((s) => s.key === step);

  const handleNextFromPersonal = () => {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    setStep("professional");
  };

  const handleNextFromProfessional = () => {
    setStep("avatar");
  };

  const handleBackToProfessional = () => setStep("professional");
  const handleBackToPersonal = () => setStep("personal");

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("full_name", fullName);
      if (gender) submitData.append("gender", gender);
      if (birthDate) submitData.append("birth_date", birthDate);
      if (phoneNumber) submitData.append("phone_number", phoneNumber);
      if (address) submitData.append("address", address);
      if (bio) submitData.append("bio", bio);
      if (identificationNumber)
        submitData.append("identification_number", identificationNumber);
      if (occupation) submitData.append("occupation", occupation);
      if (institution) submitData.append("institution", institution);

      if (avatarFile instanceof File) {
        submitData.append("avatar", avatarFile);
      } else if (typeof avatarFile === "string" && avatarFile) {
        submitData.append("avatar_url", avatarFile);
      }

      const res = await authService.setupProfile(submitData);
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
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-brand-primary/10 via-white to-brand-primary-light/5 dark:from-brand-primary/5 dark:via-gray-950 dark:to-brand-primary-dark/10 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-primary-dark/5 dark:bg-brand-primary-dark/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <SetupStepIndicator
          steps={SETUP_STEPS}
          currentStepIndex={currentStepIndex}
        />

        <AnimatePresence mode="wait">
          {step === "personal" && (
            <motion.div
              key="personal"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={cardTransition}
            >
              <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-full" />
                <SetupStepPersonal
                  user={user}
                  fullName={fullName}
                  setFullName={setFullName}
                  gender={gender}
                  setGender={setGender}
                  birthDate={birthDate}
                  setBirthDate={setBirthDate}
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                  identificationNumber={identificationNumber}
                  setIdentificationNumber={setIdentificationNumber}
                  loading={submitting}
                  onNext={handleNextFromPersonal}
                />
              </Card>
            </motion.div>
          )}

          {step === "professional" && (
            <motion.div
              key="professional"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={cardTransition}
            >
              <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-full" />
                <SetupStepProfessional
                  occupation={occupation}
                  setOccupation={setOccupation}
                  institution={institution}
                  setInstitution={setInstitution}
                  address={address}
                  setAddress={setAddress}
                  bio={bio}
                  setBio={setBio}
                  loading={submitting}
                  onBack={handleBackToPersonal}
                  onNext={handleNextFromProfessional}
                />
              </Card>
            </motion.div>
          )}

          {step === "avatar" && (
            <motion.div
              key="avatar"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={cardTransition}
            >
              <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-full" />
                <SetupStepAvatar
                  avatarFile={avatarFile}
                  setAvatarFile={setAvatarFile}
                  loading={submitting}
                  onBack={handleBackToProfessional}
                  onSubmit={handleSubmit}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
