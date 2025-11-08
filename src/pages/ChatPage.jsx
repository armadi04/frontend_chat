import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  LogOut,
  Send,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { io } from "socket.io-client";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const user = sessionStorage.getItem("currentUser");
    if (!user) {
      navigate("/");
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;
    setConnectionStatus("connecting");

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/messages`);
        if (!response.ok) {
          throw new Error("Gagal memuat pesan");
        }
        const data = await response.json();
        if (!cancelled) {
          const sorted = Array.isArray(data)
            ? data.sort(
                (a, b) =>
                  new Date(a.createdAt || 0).getTime() -
                  new Date(b.createdAt || 0).getTime()
              )
            : [];
          setMessages(sorted);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching messages", err);
          setError(err.message || "Tidak dapat terhubung ke server");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    const socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("connected");
      setError("");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
      setIsSending(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error", err);
      setConnectionStatus("error");
      setError("Gagal terhubung ke server realtime");
      setIsSending(false);
    });

    socket.on("message:new", (incoming) => {
      if (!incoming) return;
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === incoming.id)) {
          return prev;
        }
        const updated = [...prev, incoming];
        return updated.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
        );
      });
    });

    socket.on("message:deleted", ({ id }) => {
      if (!id) return;
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    return () => {
      cancelled = true;
      socket.off("message:new");
      socket.off("message:deleted");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser]);

  const sendMessage = useCallback(() => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    if (!currentUser) {
      setError("Silakan login ulang");
      return;
    }

    const socket = socketRef.current;
    if (!socket) {
      setError("Koneksi realtime belum siap");
      return;
    }

    setIsSending(true);
    setNewMessage("");

    socket.emit(
      "message:create",
      {
        username: currentUser,
        text: trimmed,
      },
      (response) => {
        setIsSending(false);
        if (response?.status === "error") {
          setError(response.error || "Gagal mengirim pesan");
        }
      }
    );
  }, [currentUser, newMessage]);

  const requestDeleteMessage = useCallback((messageId) => {
    if (!messageId) return;
    const socket = socketRef.current;

    if (socket?.connected) {
      socket.emit("message:delete", messageId, (response) => {
        if (response?.status === "error") {
          setError(response.error || "Gagal menghapus pesan");
        }
      });
    } else {
      fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: "DELETE",
      }).catch((err) => {
        console.error("Delete message failed", err);
        setError("Gagal menghapus pesan");
      });
    }
  }, []);

  const deleteMessage = (messageId) => {
    requestDeleteMessage(messageId);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    navigate("/thanks");
  };

  const getAvatarColor = (username) => {
    const colors = {
      lexsa: "hsl(200 70% 70%)",
      naqieya: "hsl(280 60% 70%)",
      novita: "hsl(340 65% 70%)",
      salsabila: "hsl(20 70% 70%)",
    };
    return colors[username] || "hsl(260 60% 70%)";
  };

  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : "?";
  };

  const formatTimestamp = (createdAt, fallback) => {
    if (createdAt) {
      try {
        return format(parseISO(createdAt), "HH:mm");
      } catch (err) {
        console.error("Failed to parse date", err);
      }
    }
    return fallback || "--:--";
  };

  const connectionLabel =
    connectionStatus === "connected"
      ? "Online"
      : connectionStatus === "connecting"
      ? "Menghubungkan"
      : connectionStatus === "error"
      ? "Gangguan"
      : "Offline";

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl max-sm:text-lg font-bold text-foreground">
                Forum Diskusi Mahasiswa
              </h1>
              <p className="text-sm text-muted-foreground">
                Hai {currentUser}, welcome to Room Chat!
              </p>
              <p className="text-xs text-muted-foreground">
                Status: {connectionLabel}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 bg-primary hover:bg-red-800 gap-0 sm:py-5 max-sm:py-6 max-sm:px-4"
          >
            <LogOut className="w-4 h-4 text-white" />
            {/* Teks muncul hanya di layar >= sm */}
            <p className="hidden sm:block text-white">Leave</p>
          </Button>
        </div>
      </header>

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/40 text-destructive text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Sabar yaa, lagi loading chat...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Yahaha chat masih kosong nih. Gass ramaikan!
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.username === currentUser;
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3 animate-fadeIn",
                    isOwnMessage && "justify-end"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Avatar */}
                  <Avatar
                    className={cn(
                      "w-10 h-10 flex-shrink-0",
                      isOwnMessage && "order-last"
                    )}
                    style={{
                      backgroundColor: getAvatarColor(message.username),
                    }}
                  >
                    <AvatarFallback className="text-white bg-primary font-semibold">
                      {getInitial(message.username)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "flex-1 min-w-0 flex flex-col",
                      isOwnMessage && "items-end"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-baseline gap-2 mb-1",
                        isOwnMessage &&
                          "flex-row-reverse text-right justify-end"
                      )}
                    >
                      <span className="font-semibold text-sm text-foreground">
                        {message.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.createdAt, message.time)} WIB
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-2 group",
                        isOwnMessage && "flex-row-reverse justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "border rounded-2xl px-4 py-3 shadow-sm",
                          isOwnMessage
                            ? "bg-primary text-primary-foreground border-transparent rounded-tr-sm"
                            : "bg-card border-border rounded-tl-sm"
                        )}
                      >
                        <p
                          className={cn(
                            "text-sm leading-relaxed break-words",
                            !isOwnMessage && "text-foreground"
                          )}
                        >
                          {message.text}
                        </p>
                      </div>
                      {/* Delete button - only show for message owner */}
                      {isOwnMessage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={() => deleteMessage(message.id)}
                              className="text-destructive focus:text-destructive focus:bg-gray-100 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <footer className="bg-card border-t border-border shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 border-1 flex items-center">
              <Textarea
                placeholder="Ketik pesan Anda disini..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] max-h-[120px] resize-none py-4"
                rows={1}
              />
              {/*Jika diperlukan, silakan di Un-comment*/}
              {/* <p className="text-xs text-muted-foreground mt-2">
                Tekan <span className="font-bold">Enter</span> untuk Mengirim
                Pesan, <span className="font-bold">Shift+Enter</span> untuk
                Paragraf baru.
              </p> */}
            </div>
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="h-12 w-12 rounded-full bg-primary shadow-md hover:bg-purple-700 hover:shadow-lg transition-all disabled:opacity-50 !cursor-pointer"
            >
              <Send className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
