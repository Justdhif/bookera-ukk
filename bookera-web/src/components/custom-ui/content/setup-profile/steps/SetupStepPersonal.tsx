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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  User as UserIcon,
  Phone,
  CreditCard,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { User } from "@/types/user";

const iconPopTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 15,
  delay: 0.2,
};

interface FormErrors {
  full_name: boolean;
  phone_number: boolean;
  identification_number: boolean;
}

interface SetupStepPersonalProps {
  user: User | null;
  fullName: string;
  setFullName: (v: string) => void;
  gender: string;
  setGender: (v: string) => void;
  birthDate: string;
  setBirthDate: (v: string) => void;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  identificationNumber: string;
  setIdentificationNumber: (v: string) => void;
  loading: boolean;
  onNext: () => void;
}

export default function SetupStepPersonal({
  user,
  fullName,
  setFullName,
  gender,
  setGender,
  birthDate,
  setBirthDate,
  phoneNumber,
  setPhoneNumber,
  identificationNumber,
  setIdentificationNumber,
  loading,
  onNext,
}: SetupStepPersonalProps) {
  const [errors, setErrors] = useState<FormErrors>({
    full_name: false,
    phone_number: false,
    identification_number: false,
  });

  const isValid =
    fullName.trim() !== "" &&
    !errors.full_name &&
    !errors.phone_number &&
    !errors.identification_number;

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setBirthDate(`${year}-${month}-${day}`);
    } else {
      setBirthDate("");
    }
  };

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
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </motion.div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Personal Information
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors mt-2">
            Tell us a bit about yourself
          </CardDescription>
          {user?.email && (
            <p className="text-sm text-brand-primary font-medium mt-2">
              {user.email}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-8">
        <div className="space-y-2">
          <Label htmlFor="full-name" variant="required">
            <UserIcon className="w-4 h-4" />
            Full Name
          </Label>
          <Input
            id="full-name"
            name="full_name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            validationType="letters-only"
            onValidationChange={(isValid) =>
              setErrors((prev) => ({ ...prev, full_name: !isValid }))
            }
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              <UserIcon className="w-4 h-4" />
              Gender
            </Label>
            <Select
              value={gender}
              onValueChange={setGender}
              disabled={loading}
            >
              <SelectTrigger className="h-10 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth-date">
              Date of Birth
            </Label>
            <DatePicker
              value={birthDate ? new Date(birthDate + "T00:00:00") : undefined}
              onChange={handleDateChange}
              placeholder="Select birth date"
              dateMode="past"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone-number">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone-number"
              name="phone_number"
              placeholder="08123456789"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              validationType="numbers-only"
              onValidationChange={(isValid) =>
                setErrors((prev) => ({ ...prev, phone_number: !isValid }))
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="identification-number">
              <CreditCard className="w-4 h-4" />
              NISN / NIP / NIK
            </Label>
            <Input
              id="identification-number"
              name="identification_number"
              placeholder="ID number"
              value={identificationNumber}
              onChange={(e) => setIdentificationNumber(e.target.value)}
              validationType="numbers-only"
              onValidationChange={(isValid) =>
                setErrors((prev) => ({
                  ...prev,
                  identification_number: !isValid,
                }))
              }
              disabled={loading}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="submit"
          onClick={onNext}
          disabled={loading || !isValid}
          className="w-full h-12 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </>
  );
}
