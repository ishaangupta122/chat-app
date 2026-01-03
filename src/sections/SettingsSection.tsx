"use client";

import { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import {
  User as UserIcon,
  Palette,
  Bell,
  Sun,
  Moon,
  Monitor,
  LogOut,
} from "lucide-react";

interface SettingsSectionProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateProfile?: (data: { name: string; avatar?: string }) => void;
  onLogout: () => void;
}

export function SettingsSection({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onLogout,
}: SettingsSectionProps) {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [activeTab, setActiveTab] = useState<
    "profile" | "appearance" | "notifications"
  >("profile");

  const handleSave = () => {
    onUpdateProfile?.({ name });
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex gap-6">
          {/* Tabs */}
          <div className="w-40 space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              }`}>
              <UserIcon className="h-5 w-5" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "appearance"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              }`}>
              <Palette className="h-5 w-5" />
              Appearance
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "notifications"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              }`}>
              <Bell className="h-5 w-5" />
              Notifications
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG up to 5MB
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Display Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input value={user.email} disabled />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">
                    Theme
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {(["light", "dark", "system"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex cursor-pointer flex-col items-center rounded-lg border-2 p-4 transition-colors ${
                          theme === t
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}>
                        {t === "light" && (
                          <Sun className="h-6 w-6 text-amber-500" />
                        )}
                        {t === "dark" && (
                          <Moon className="h-6 w-6 text-blue-500" />
                        )}
                        {t === "system" && (
                          <Monitor className="h-6 w-6 text-muted-foreground" />
                        )}
                        <span className="mt-2 text-sm font-medium capitalize text-foreground">
                          {t}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Message Notifications
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Get notified when you receive a message
                    </p>
                  </div>
                  <button className="h-6 w-11 rounded-full bg-primary p-1">
                    <div className="h-4 w-4 translate-x-5 rounded-full bg-primary-foreground transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sound</p>
                    <p className="text-xs text-muted-foreground">
                      Play sound for new messages
                    </p>
                  </div>
                  <button className="h-6 w-11 rounded-full bg-primary p-1">
                    <div className="h-4 w-4 translate-x-5 rounded-full bg-primary-foreground transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Message Preview
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Show message preview in notifications
                    </p>
                  </div>
                  <button className="h-6 w-11 rounded-full bg-muted p-1">
                    <div className="h-4 w-4 rounded-full bg-muted-foreground transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="space-y-2">
          <Separator />
          <div className="pt-2">
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              Log Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
