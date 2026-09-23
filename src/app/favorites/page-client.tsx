"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFavorites, removeFavorite } from "@/lib/firebase/user-service";
import type { FavoriteItem } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Trash2, Loader2, ExternalLink, ArrowLeft, LogIn } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/constants";
import { SignInDialog } from "@/components/auth/signin-dialog";

export function FavoritesPageClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/?signin=true");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    getFavorites(user.uid)
      .then((items) => {
        if (!cancelled) {
          setFavorites(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load favorites");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [user]);

  const handleRemove = async (item: FavoriteItem) => {
    if (!user) return;
    try {
      await removeFavorite(user.uid, item.id);
      setFavorites((prev) => prev.filter((f) => f.id !== item.id));
      toast.success(`Removed "${item.toolName}" from favorites`);
    } catch {
      toast.error("Failed to remove favorite");
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="mb-8">
          <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
            <ArrowLeft className="h-3 w-3" /> Browse tools
          </Link>
          <h1 className="text-3xl font-bold mb-2">Favorites</h1>
          <p className="text-muted-foreground">Your saved tools</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Please log in first</h3>
            <p className="text-muted-foreground mb-4">
              Sign in to save your favorite tools and access them across devices.
            </p>
            <Button onClick={() => setShowSignIn(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </CardContent>
        </Card>
        <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
      </div>
    );
  }

  const getCategoryName = (catId: string) =>
    CATEGORIES.find((c) => c.id === catId)?.name ?? catId;

  const getItemHref = (item: FavoriteItem) =>
    `/${item.productType === "app" ? "apps" : "tools"}/${item.toolSlug}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="h-3 w-3" /> Browse tools
        </Link>
        <h1 className="text-3xl font-bold mb-2">Favorites</h1>
        <p className="text-muted-foreground">
          {favorites.length === 0
            ? "You haven't saved any tools yet."
            : `${favorites.length} saved tool${favorites.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-4">
              Browse tools and click the heart icon to save them here for quick access.
            </p>
            <Button onClick={() => router.push("/tools")}>
              Browse Tools
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {favorites.map((item) => (
            <Card key={item.id} className="group">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={getItemHref(item)}
                      className="font-medium hover:text-primary transition-colors truncate"
                    >
                      {item.toolName}
                    </Link>
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                      {getCategoryName(item.category)}
                    </span>
                    <span>
                      Saved {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(getItemHref(item))}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}