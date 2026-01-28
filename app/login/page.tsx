"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useFormSecurity } from "@/hooks/use-form-security";
import { Mail, Loader2, ArrowLeft, Shield } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import SocialLoginButtons from "@/components/social-login-buttons";

export default function LoginPage() {
  const router = useRouter();
  const { setSession, isAuthenticated } = useAuthStore();
  const { 
    csrfToken, 
    isLoading: securityLoading, 
    getSecureFormData,
    getHoneypotFieldProps,
    HONEYPOT_FIELDS 
  } = useFormSecurity();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const secureData = getSecureFormData({ email });
      const res = await fetch("/api/user/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(secureData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setStep("otp");
      setResendCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const secureData = getSecureFormData({
        email,
        code: otp,
        purpose: "login",
      });
      const res = await fetch("/api/user/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(secureData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      // Set session in auth store using SessionDTO from data property
      setSession(data.data);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;

    setError("");
    setIsLoading(true);

    try {
      const secureData = getSecureFormData({ email });
      const res = await fetch("/api/user/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(secureData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setResendCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp("");
    setError("");
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-20 bg-muted/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 md:top-36 md:left-16">
          <div className="w-12 h-12 md:w-20 md:h-20 rotate-45 border-2 rounded-sm border-black" />
        </div>

        <div className="absolute top-20 right-4 md:top-32 md:right-16">
          <div className="w-12 h-12 md:w-28 md:h-28 rotate-12 border-2 rounded-sm border-black" />
        </div>

        <div className="absolute top-[38%] left-1 md:top-[42%] md:left-8 space-y-1 md:space-y-2">
          <div className="w-2 h-2 md:w-3 md:h-3 border-2 rounded-full border-black" />
          <div className="w-2 h-2 md:w-3 md:h-3 border-2 border-black" />
          <div
            className="w-2 h-2 md:w-3 md:h-3 rotate-45 border-2 border-red-500"
            style={{ borderColor: "#EF4444" }}
          />
        </div>

        <div className="absolute bottom-32 left-4 md:bottom-32 md:left-16">
          <svg
            width="100"
            height="140"
            viewBox="0 0 100 140"
            className="md:hidden"
          >
            <line
              x1="35"
              y1="65"
              x2="10"
              y2="120"
              stroke="#000000"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <line
              x1="45"
              y1="70"
              x2="20"
              y2="125"
              stroke="#000000"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
          <svg
            width="180"
            height="250"
            viewBox="0 0 180 250"
            className="hidden md:block"
          >
            <line
              x1="60"
              y1="115"
              x2="15"
              y2="215"
              stroke="#000000"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <line
              x1="80"
              y1="125"
              x2="35"
              y2="225"
              stroke="#000000"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="absolute bottom-12 right-4 md:bottom-20 md:right-12">
          <svg
            width="160"
            height="200"
            viewBox="0 0 160 200"
            className="md:hidden"
          >
            <circle cx="75" cy="65" r="27" fill="#000000" />
            <rect
              x="65"
              y="120"
              width="75"
              height="70"
              fill="#000000"
              transform="rotate(8 102 155)"
            />
          </svg>
          <svg
            width="280"
            height="350"
            viewBox="0 0 280 350"
            className="hidden md:block"
          >
            <circle cx="130" cy="115" r="48" fill="#000000" />
            <rect
              x="115"
              y="210"
              width="130"
              height="120"
              fill="#000000"
              transform="rotate(8 180 270)"
            />
          </svg>
        </div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="bg-background border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8" />
              <h1 className="text-3xl md:text-4xl font-bold">Login</h1>
            </div>
            <p className="text-muted-foreground">
              {step === "email"
                ? "Enter your email to receive a verification code"
                : "Enter the 6-digit code sent to your email"}
            </p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              {/* Honeypot fields - hidden from users */}
              <input
                {...(getHoneypotFieldProps('website') as React.InputHTMLAttributes<HTMLInputElement>)}
                style={{ position: 'absolute', left: '-9999px' }}
              />
              <input
                {...(getHoneypotFieldProps('company') as React.InputHTMLAttributes<HTMLInputElement>)}
                style={{ position: 'absolute', left: '-9999px' }}
              />
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 rounded-xl"
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || securityLoading || !csrfToken}
                className="w-full rounded-xl text-base h-auto py-3 bg-foreground text-background hover:bg-foreground/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-foreground font-medium hover:underline"
                >
                  Register here
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* Honeypot fields - hidden from users */}
              <input
                {...(getHoneypotFieldProps('website') as React.InputHTMLAttributes<HTMLInputElement>)}
                style={{ position: 'absolute', left: '-9999px' }}
              />
              <input
                {...(getHoneypotFieldProps('company') as React.InputHTMLAttributes<HTMLInputElement>)}
                style={{ position: 'absolute', left: '-9999px' }}
              />
              
              <button
                type="button"
                onClick={handleBackToEmail}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Change email
              </button>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData('text').replace(/\s/g, '').slice(0, 6);
                      if (/^\d{6}$/.test(pastedData)) {
                        setOtp(pastedData);
                      }
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Code sent to {email}
                </p>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6 || securityLoading || !csrfToken}
                className="w-full rounded-xl text-base h-auto py-3 bg-foreground text-background hover:bg-foreground/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <div className="text-center text-sm">
                {resendCountdown > 0 ? (
                  <span className="text-muted-foreground">
                    Resend code in {resendCountdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-foreground font-medium hover:underline"
                  >
                    Resend verification code
                  </button>
                )}
              </div>
            </form>
          )}
          <div className="mt-8 pt-6">
            <SocialLoginButtons />
          </div>
          <div className="mt-8 pt-6 border-t border-border">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
