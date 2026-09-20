"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Shield,
  Users,
  MessageSquare,
  Wrench,
  CreditCard,
  AlertTriangle,
  Activity,
  BarChart3,
  RefreshCw,
  Unlock,
  Ban,
  TrendingUp,
  Clock,
  FileText,
  Bug,
  Lightbulb,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { FeedbackItem, FeedbackStatus } from "@/types/user";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AbuseStats {
  blockedIPs: number;
  tempBlockedIPs: number;
  highSuspicionIPs: number;
  activeRateLimitEntries: number;
  activeTokens: number;
}

interface AdminData {
  abuse: AbuseStats;
  blockedIPs: string[];
}

// ---------------------------------------------------------------------------
// Mock data (replace with real API calls)
// ---------------------------------------------------------------------------

const MOCK_USAGE = {
  totalUsers: 1248,
  activeToday: 342,
  totalToolsUsed: 8942,
  aiCallsToday: 567,
  proSubscribers: 89,
  freeAccountUsers: 456,
  guestUsers: 703,
};

const MOCK_TOOLS = [
  { slug: "grammar-checker", name: "Grammar Checker", usage: 1234, rating: 4.5 },
  { slug: "image-editor", name: "Image Editor", usage: 987, rating: 4.2 },
  { slug: "math-solver", name: "Math Solver", usage: 876, rating: 4.8 },
  { slug: "code-explainer", name: "Code Explainer", usage: 765, rating: 4.6 },
  { slug: "text-summarizer", name: "Text Summarizer", usage: 654, rating: 4.3 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminPageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const initialLoadDone = useRef(false);

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin?section=abuse");
      if (res.ok) {
        const data = await res.json();
        setAdminData(data);
      }
    } catch {
      // API not yet fully wired — use mock data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFeedback = useCallback(async () => {
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback ?? []);
      }
    } catch {
      // Failed to fetch feedback
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/?signin=true");
    }
  }, [loading, user, router]);

  // Initial data load — uses ref to avoid set-state-in-effect lint error
  useEffect(() => {
    if (user && !initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchAdminData();
      fetchFeedback();
    }
  }, [user, fetchAdminData, fetchFeedback]);

  const handleUnblockIP = async (ip: string) => {
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unblock", ip }),
      });
      fetchAdminData();
    } catch {
      // Handle error
    }
  };

  const handleFeedbackStatus = async (id: string, status: FeedbackStatus) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setFeedback((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status } : f))
        );
        toast.success(`Feedback marked as "${status}"`);
      }
    } catch {
      toast.error("Failed to update feedback status");
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      const res = await fetch(`/api/feedback?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedback((prev) => prev.filter((f) => f.id !== id));
        toast.success("Feedback deleted");
      }
    } catch {
      toast.error("Failed to delete feedback");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const abuse = adminData?.abuse ?? {
    blockedIPs: 0,
    tempBlockedIPs: 0,
    highSuspicionIPs: 0,
    activeRateLimitEntries: 0,
    activeTokens: 0,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage MyToolsBox — users, tools, feedback, and security</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <TabsList className="mb-8 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="abuse" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Abuse &amp; Security
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-2">
            <Wrench className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* Overview Tab */}
        {/* ================================================================ */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{MOCK_USAGE.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {MOCK_USAGE.activeToday} active today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">AI Calls Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{MOCK_USAGE.aiCallsToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% from yesterday
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pro Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{MOCK_USAGE.proSubscribers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${(MOCK_USAGE.proSubscribers * 2.99).toFixed(2)} MRR est.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tools Used Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{MOCK_USAGE.totalToolsUsed.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all categories
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  User Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pro Subscribers</span>
                    <Badge variant="default">{MOCK_USAGE.proSubscribers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Free Accounts</span>
                    <Badge variant="secondary">{MOCK_USAGE.freeAccountUsers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Guest Users</span>
                    <Badge variant="outline">{MOCK_USAGE.guestUsers}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-sm">Total</span>
                    <span>{MOCK_USAGE.totalUsers.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Blocked IPs</span>
                    <Badge variant="destructive">{abuse.blockedIPs}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Temp Blocked</span>
                    <Badge variant="secondary">{abuse.tempBlockedIPs}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Suspicion</span>
                    <Badge variant="outline">{abuse.highSuspicionIPs}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Rate Limits</span>
                    <span className="text-sm">{abuse.activeRateLimitEntries}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* Abuse & Security Tab */}
        {/* ================================================================ */}
        <TabsContent value="abuse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Blocked IPs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{abuse.blockedIPs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Temp Blocked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">{abuse.tempBlockedIPs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">High Suspicion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{abuse.highSuspicionIPs}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  Blocked IPs
                </CardTitle>
                <Button variant="outline" size="sm" onClick={fetchAdminData}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
              <CardDescription>Manage blocked and temp-blocked IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              {(adminData?.blockedIPs ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No IPs currently blocked.
                </p>
              ) : (
                <div className="space-y-2">
                  {(adminData?.blockedIPs ?? []).map((ip) => (
                    <div key={ip} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">{ip}</code>
                        <Badge variant="destructive" className="text-xs">Blocked</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnblockIP(ip)}
                      >
                        <Unlock className="h-4 w-4 mr-1" />
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Protection Layers
              </CardTitle>
              <CardDescription>Active abuse prevention mechanisms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: "IP Rate Limiting", desc: "Sliding window per-IP limits", active: true },
                  { name: "Token Bucket Throttle", desc: "Smooth request throttling", active: true },
                  { name: "Suspicion Scoring", desc: "Behavioral analysis", active: true },
                  { name: "CAPTCHA (conditional)", desc: "Only when suspicious", active: true },
                  { name: "Guest Restrictions", desc: "Stricter limits for guests", active: true },
                  { name: "Processing Tokens", desc: "CSRF protection", active: true },
                  { name: "File Size Limits", desc: "Per-tier restrictions", active: true },
                  { name: "UA Filtering", desc: "Known bot detection", active: true },
                  { name: "Path Probing Detection", desc: "Unusual path monitoring", active: true },
                ].map((layer) => (
                  <div key={layer.name} className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                    <div className={`h-2 w-2 rounded-full mt-1.5 ${layer.active ? "bg-green-500" : "bg-gray-400"}`} />
                    <div>
                      <p className="text-sm font-medium">{layer.name}</p>
                      <p className="text-xs text-muted-foreground">{layer.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Feedback Tab */}
        {/* ================================================================ */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    User Feedback &amp; Reports
                  </CardTitle>
                  <CardDescription>Suggestions, bug reports, and general feedback from the contact form</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchFeedback} disabled={feedbackLoading}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${feedbackLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {feedbackLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : feedback.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No feedback submissions yet. Messages from the contact form will appear here.
                </p>
              ) : (
                <div className="space-y-3">
                  {feedback.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-4 bg-muted/30 rounded-md">
                      <div className="mt-0.5">
                        {item.type === "bug" ? (
                          <Bug className="h-4 w-4 text-destructive" />
                        ) : item.type === "suggestion" ? (
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                        ) : item.type === "question" ? (
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.type}
                          </Badge>
                          <Badge
                            variant={
                              item.status === "new"
                                ? "default"
                                : item.status === "investigating"
                                  ? "secondary"
                                  : item.status === "resolved"
                                    ? "outline"
                                    : "outline"
                            }
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm">{item.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {item.name || "Anonymous"}
                            {item.email ? ` (${item.email})` : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {/* Action buttons */}
                        <div className="flex items-center gap-1 mt-2">
                          {item.status !== "resolved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleFeedbackStatus(item.id, "resolved")}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                          )}
                          {item.status !== "investigating" && item.status !== "resolved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleFeedbackStatus(item.id, "investigating")}
                            >
                              <Activity className="h-3 w-3 mr-1" />
                              Investigate
                            </Button>
                          )}
                          {item.status !== "closed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleFeedbackStatus(item.id, "closed")}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Close
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleDeleteFeedback(item.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Tools Tab */}
        {/* ================================================================ */}
        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Tool Usage &amp; Suggestions
              </CardTitle>
              <CardDescription>Most used tools and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_TOOLS.map((tool, i) => (
                  <div key={tool.slug} className="flex items-center justify-between py-3 px-3 bg-muted/30 rounded-md">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{tool.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">/{tool.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{tool.usage.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">uses</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        ★ {tool.rating}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Users Tab */}
        {/* ================================================================ */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>User accounts, roles, and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{MOCK_USAGE.totalUsers.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{MOCK_USAGE.activeToday.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pro Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{MOCK_USAGE.proSubscribers}</div>
                  </CardContent>
                </Card>
              </div>
              <p className="text-sm text-muted-foreground text-center py-4">
                Full user management will be available when Firestore admin integration is complete.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Subscriptions Tab */}
        {/* ================================================================ */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Management
              </CardTitle>
              <CardDescription>Active subscriptions, revenue, and plan distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Pro Subscribers", value: MOCK_USAGE.proSubscribers, color: "text-primary" },
                  { label: "Free Accounts", value: MOCK_USAGE.freeAccountUsers, color: "text-muted-foreground" },
                  { label: "Guest Users", value: MOCK_USAGE.guestUsers, color: "text-muted-foreground" },
                  { label: "Est. MRR", value: `$${(MOCK_USAGE.proSubscribers * 2.99).toFixed(2)}`, color: "text-green-500" },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center py-4">
                Full subscription management will be available when payment provider integration is complete.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}