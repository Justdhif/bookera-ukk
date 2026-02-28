"use client";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, ArrowRight, LogIn } from "lucide-react";

interface LoginFormProps {
  loading: boolean;
  onLogin: (email: string, password: string, remember: boolean) => void;
  onSwitchToRegister: () => void;
  onOpenTos: () => void;
  onOpenPrivacy: () => void;
}

const inputClassName =
  "h-12 px-4 transition-all duration-200 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";

export default function LoginForm({
  loading,
  onLogin,
  onSwitchToRegister,
  onOpenTos,
  onOpenPrivacy,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, remember);
  };

  return (
    <Card className="w-full border-0 dark:border dark:border-gray-700 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-colors overflow-hidden">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-full" />

      <CardHeader className="space-y-4 text-center pb-6">
        <div className="flex items-center justify-center gap-2">
          <LogIn className="w-6 h-6 text-brand-primary" />
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Sign In to Bookera
          </CardTitle>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors">
          Sign in using your school account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="login-email">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="login-email"
              placeholder="email@school.edu"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClassName}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="login-password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputClassName} pr-12`}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 dark:text-gray-300 hover:text-brand-primary hover:bg-transparent"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(!!checked)}
                disabled={loading}
              />
              <Label
                htmlFor="remember"
                className="text-sm text-gray-600 dark:text-gray-300 transition-colors font-normal cursor-pointer"
              >
                Remember this device
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              onClick={() => router.push("/forgot-password")}
              className="text-sm font-medium text-brand-primary hover:text-brand-primary-dark p-0 h-auto"
              disabled={loading}
            >
              Forgot password?
            </Button>
          </div>

          <Button
            type="submit"
            variant="submit"
            loading={loading}
            className="w-full h-12 text-base font-semibold rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
            spinnerClassName="text-white"
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
              Don&apos;t have an account?{" "}
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToRegister}
                className="font-semibold text-brand-primary hover:text-brand-primary-dark p-0 h-auto underline-offset-4"
                disabled={loading}
              >
                Register now
              </Button>
            </p>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1 transition-colors">
            <p>By continuing, you agree to our</p>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              <Button
                type="button"
                variant="link"
                onClick={onOpenTos}
                className="text-brand-primary hover:text-brand-primary-dark font-medium p-0 h-auto text-xs"
                disabled={loading}
              >
                Terms of Service
              </Button>
              <span>and</span>
              <Button
                type="button"
                variant="link"
                onClick={onOpenPrivacy}
                className="text-brand-primary hover:text-brand-primary-dark font-medium p-0 h-auto text-xs"
                disabled={loading}
              >
                Privacy Policy
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
