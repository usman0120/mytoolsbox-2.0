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
import { useI18n } from "@/lib/i18n";

export function FavoritesPageClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t, localizePath, getToolName, getCategoryName: getCatNameI18n } = useI18n();
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
      toast.success(t("fav_remove"));
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
          <Link href={localizePath("/tools")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
            <ArrowLeft className="h-3 w-3" /> {t("fav_browse")}
          </Link>
          <h1 className="text-3xl font-bold mb-2">{t("fav_title")}</h1>
          <p className="text-muted-foreground">{t("fav_subtitle")}</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("auth_login_required")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("auth_login_desc")}
            </p>
            <Button onClick={() => setShowSignIn(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              {t("auth_signin")}
            </Button>
          </CardContent>
        </Card>
        <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
      </div>
    );
  }

  const getItemHref = (item: FavoriteItem) =>
    localizePath(`/${item.productType === "app" ? "apps" : "tools"}/${item.toolSlug}`);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Link href={localizePath("/tools")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="h-3 w-3" /> {t("fav_browse")}
        </Link>
        <h1 className="text-3xl font-bold mb-2">{t("fav_title")}</h1>
        <p className="text-muted-foreground">
          {favorites.length === 0
            ? t("fav_empty")
            : `${favorites.length} ${t("fav_title").toLowerCase()}`}
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("fav_empty")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("fav_subtitle")}
            </p>
            <Button onClick={() => router.push(localizePath("/tools"))}>
              {t("fav_browse")}
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
                      {getToolName(item.toolSlug, item.toolName)}
                    </Link>
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                      {getCatNameI18n(item.category, item.category)}
                    </span>
                    <span>
                      {new Date(item.addedAt).toLocaleDateString()}
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