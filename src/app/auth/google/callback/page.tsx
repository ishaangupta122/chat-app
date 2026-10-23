"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithGoogle } from "@/services/auth";
import { getAuthErrorMessage } from "@/lib/helpers";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function GoogleCallbackPage() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Prevent double processing
    if (isProcessing) return;
    setIsProcessing(true);

    const handleCallback = async () => {
      try {
        // Get the hash fragment from URL
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const idToken = params.get("id_token");
        const errorParam = params.get("error");

        if (errorParam) {
          const errorMsg =
            "Google sign-in was cancelled or failed. Please try again.";
          setError(errorMsg);
          // Use setTimeout to ensure toast shows after render
          setTimeout(() => toast.error(errorMsg), 100);
          return;
        }

        if (!idToken) {
          const errorMsg = "Google sign-in failed. Please try again.";
          setError(errorMsg);
          setTimeout(() => toast.error(errorMsg), 100);
          return;
        }

        // Send the ID token to our backend
        await loginWithGoogle(idToken);

        // Refresh auth context with new user data
        refreshUser();

        // Store success message in sessionStorage for the home page to show
        sessionStorage.setItem(
          "auth_toast",
          JSON.stringify({
            type: "success",
            message: "Signed in with Google successfully!",
          })
        );

        // Redirect to home using Next.js router
        router.replace("/");
      } catch (err) {
        const errorMsg = getAuthErrorMessage(
          err,
          "Unable to sign in with Google. Please try again."
        );
        setError(errorMsg);
        // Use setTimeout to ensure toast shows after render
        setTimeout(() => toast.error(errorMsg), 100);
      }
    };

    handleCallback();
  }, [isProcessing, refreshUser, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <a href="/login" className="text-primary hover:underline">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
