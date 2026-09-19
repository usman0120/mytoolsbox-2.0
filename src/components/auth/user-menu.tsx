"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Heart, Clock, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";

export function UserMenu() {
  const { user, isAnonymous, logOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const displayName = user.displayName ?? (isAnonymous ? "Guest" : "User");
  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : isAnonymous
      ? "G"
      : user.email?.slice(0, 2).toUpperCase() ?? "U";

  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">
              {displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email ?? (isAnonymous ? "Guest account" : "")}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAnonymous && (
          <>
            <DropdownMenuItem onClick={() => router.push("/account")}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Upgrade account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/favorites")}>
          <Heart className="mr-2 h-4 w-4" />
          Favorites
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/history")}>
          <Clock className="mr-2 h-4 w-4" />
          History
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}