import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const VALID_USERS = ["lexsa", "naqieya", "novita", "salsabila"];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = sessionStorage.getItem("currentUser");
    if (currentUser && VALID_USERS.includes(currentUser)) {
      navigate("/chat");
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedUsername) {
      setError("Silakan masukkan username Anda.");
      return;
    }

    if (!VALID_USERS.includes(trimmedUsername)) {
      setError(
        "Invalid username. Please use: lexsa, naqieya, novita, or salsabila"
      );
      return;
    }

    // Store user in sessionStorage
    sessionStorage.setItem("currentUser", trimmedUsername);

    // Also store login timestamp
    localStorage.setItem(
      `lastLogin_${trimmedUsername}`,
      new Date().toISOString()
    );

    // Navigate to chat
    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      <Card className="w-full max-w-md p-8 shadow-elegant animate-fadeIn">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo/Icon */}
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-lg">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Forum Diskusi Mahasiswa
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to join the conversation
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="w-full"
                autoComplete="username"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive animate-slideIn">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-white hover:opacity-90"
            >
              Login
            </Button>
            <p className="text-center opacity-70 text-sm">
              Press Enter to login
            </p>
          </form>

          {/* Silakan di un-comment jika dibutuhkan */}
          {/* <div className="text-center space-y-2 pt-4 border-t border-border w-full">
            <p className="text-xs text-muted-foreground">Valid usernames:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {VALID_USERS.map((user) => (
                <span
                  key={user}
                  className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                >
                  {user}
                </span>
              ))}
            </div>
          </div> */}
        </div>
      </Card>
    </div>
  );
}
