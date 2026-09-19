"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  getUserPreferences, saveUserPreferences,
  getUserProfile, saveUserProfile,
} from "@/lib/firebase/user-service";
import type { UserPreferences, UserProfile } from "@/types/user";
import { DEFAULT_PREFERENCES, DEFAULT_PROFILE } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  User, Settings, Palette, Bell, Shield, Loader2, Save, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/constants";

export function SettingsPageClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/?signin=true");
    }
  }, [authLoading, user, router]);

  // Load data
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [p, prof] = await Promise.all([
        getUserPreferences(user.uid),
        getUserProfile(user.uid),
      ]);
      setPrefs(p);
      if (prof) setProfile(prof);
      setLoaded(true);
    };
    load();
  }, [user]);

  const handleSavePreferences = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserPreferences(user.uid, prefs);
      toast.success("Preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }, [user, prefs]);

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserProfile(user.uid, profile);
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }, [user, profile]);

  if (authLoading || !loaded) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account, preferences, and profile.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="mr-2 h-4 w-4" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="danger">
            <Shield className="mr-2 h-4 w-4" /> Account
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your public profile displayed across MyToolsBox.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email ?? ""} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder={user.displayName ?? "Your name"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us a little about yourself..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Default Preferences</CardTitle>
              <CardDescription>Set your default tool category and other preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCategory">Default Category</Label>
                <Select
                  value={prefs.defaultCategory}
                  onValueChange={(v) => setPrefs({ ...prefs, defaultCategory: v as UserPreferences["defaultCategory"] })}
                >
                  <SelectTrigger id="defaultCategory">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={prefs.language}
                  onValueChange={(v) => setPrefs({ ...prefs, language: v ?? "en" })}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ur">Urdu</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSavePreferences} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how MyToolsBox looks for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={prefs.theme}
                  onValueChange={(v) => setPrefs({ ...prefs, theme: v as UserPreferences["theme"] })}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose between light, dark, or follow your system preference.
                </p>
              </div>
              <Button onClick={handleSavePreferences} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Appearance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your email notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about new tools and features.</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={prefs.emailNotifications}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, emailNotifications: checked })}
                />
              </div>
              <Button onClick={handleSavePreferences} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Notifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account / Danger Zone */}
        <TabsContent value="danger">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account and data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-1">Account Information</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Signed in as <strong>{user.email}</strong>
                  {user.providerData[0]?.providerId === "google.com" ? " via Google" : " via Email"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Account created: {user.metadata.creationTime ?? "Unknown"}
                </p>
              </div>
              <Separator />
              <div className="rounded-lg border border-destructive/50 p-4">
                <h4 className="font-medium text-destructive mb-1">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Deleting your account will permanently remove all your data including favorites, history, and preferences.
                  This action cannot be undone.
                </p>
                <Button variant="destructive" disabled>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Account deletion will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}