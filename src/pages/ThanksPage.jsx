import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Heart } from "lucide-react";

export default function ThanksPage() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem("currentUser");
    if (user) {
      setUsername(user);
      // Clear session storage on logout
      sessionStorage.removeItem("currentUser");
    }
  }, []);

  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      <Card className="w-full max-w-md p-8 shadow-elegant animate-fadeIn">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-lg animate-pulse">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-card border-4 border-card flex items-center justify-center">
              <Heart className="w-5 h-5 text-destructive fill-destructive" />
            </div>
          </div>

          {/* Thank You Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">
              Thank You
              {username &&
                `, ${username.charAt(0).toUpperCase() + username.slice(1)}`}
              !
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Your input is very valuable for the development of our campus.
            </p>
          </div>

          {/* Decorative divider */}
          <div className="w-full flex items-center space-x-4">
            <div className="flex-1 h-px bg-border"></div>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              We hope to see you again soon!
            </p>
          </div>

          {/* Back to Login Button */}
          <Button
            onClick={handleBackToLogin}
            className="w-full gradient-primary text-white hover:opacity-90"
          >
            Log in again
          </Button>
        </div>
      </Card>
    </div>
  );
}
