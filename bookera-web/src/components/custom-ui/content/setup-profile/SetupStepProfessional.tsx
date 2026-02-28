"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Building2,
  MapPin,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const iconPopTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 15,
  delay: 0.2,
};

interface FormErrors {
  occupation: boolean;
  institution: boolean;
}

interface SetupStepProfessionalProps {
  occupation: string;
  setOccupation: (v: string) => void;
  institution: string;
  setInstitution: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export default function SetupStepProfessional({
  occupation,
  setOccupation,
  institution,
  setInstitution,
  address,
  setAddress,
  bio,
  setBio,
  loading,
  onBack,
  onNext,
}: SetupStepProfessionalProps) {
  const [errors, setErrors] = useState<FormErrors>({
    occupation: false,
    institution: false,
  });

  const isValid = !errors.occupation && !errors.institution;

  return (
    <>
      <CardHeader className="space-y-4 text-center pb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={iconPopTransition}
          className="flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
        </motion.div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Professional Details
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors mt-2">
            Share your professional background (all optional)
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="occupation">
              <Briefcase className="w-4 h-4" />
              Occupation
            </Label>
            <Input
              id="occupation"
              name="occupation"
              placeholder="Student, Teacher, etc."
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              validationType="letters-only"
              onValidationChange={(isValid) =>
                setErrors((prev) => ({ ...prev, occupation: !isValid }))
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">
              <Building2 className="w-4 h-4" />
              Institution
            </Label>
            <Input
              id="institution"
              name="institution"
              placeholder="School or organization"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              validationType="alphanumeric"
              onValidationChange={(isValid) =>
                setErrors((prev) => ({ ...prev, institution: !isValid }))
              }
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">
            <MapPin className="w-4 h-4" />
            Address
          </Label>
          <Textarea
            id="address"
            placeholder="Enter your full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="px-4 py-3 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 resize-none"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">
            Bio
          </Label>
          <Textarea
            id="bio"
            placeholder="Tell us a little about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="px-4 py-3 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 resize-none"
            disabled={loading}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
            className="h-12 px-5 rounded-lg border-gray-300 dark:border-gray-600 hover:border-brand-primary/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            type="button"
            variant="submit"
            onClick={onNext}
            disabled={loading || !isValid}
            className="flex-1 h-12 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </>
  );
}
