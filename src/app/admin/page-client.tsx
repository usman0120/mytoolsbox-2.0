"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { isAdminIdentity } from "@/lib/auth/admin-policy";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
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
  Clock,
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

function requestError(status: number, resource: string) {
  if (status === 401) return "Session expired or invalid. Sign in again.";
  if (status === 403) return "Admin access required. This account is not authorized.";
  if (status === 404) return `${resource} unavailable. Endpoint not found (404).`;
  if (status === 503) return `${resource} unavailable. Service unavailable (503).`;
  return `${resource} request failed (${status}). Try again.`;
}

function isAdminData(value: unknown): value is AdminData {
  if (!value || typeof value !== "object") return false;
  const data = value as AdminData;
  return !!data.abuse && ["blockedIPs", "tempBlockedIPs", "highSuspicionIPs", "activeRateLimitEntries", "activeTokens"].every((key) => {
    const count = data.abuse[key as keyof AbuseStats];
    return Number.isFinite(count) && count >= 0;
  }) && Array.isArray(data.blockedIPs) && data.blockedIPs.every((ip) => typeof ip === "string");
}

function isFeedback(value: unknown): value is FeedbackItem[] {
  return Array.isArray(value) && value.every((item) => item && typeof item.id === "string"
    && typeof item.message === "string" && typeof item.name === "string" && typeof item.email === "string"
    && ["suggestion", "bug", "feedback", "question"].includes(item.type)
    && ["new", "investigating", "resolved", "closed"].includes(item.status)
    && Number.isFinite(item.createdAt) && !Number.isNaN(new Date(item.createdAt).getTime()));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminPageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/?signin=true");
  }, [loading, user, router]);

  if (loading) return <p role="status" className="py-8 text-center">Loading account...</p>;
  if (!user) return null;

  if (!isAdminIdentity(user)) {
    return (
      <PageShell className="max-w-2xl py-16">
        <Card
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border-destructive/30 bg-card p-6 sm:p-8 text-center shadow-xs"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
            <Shield className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight mb-2">
            Admin Access Restricted
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            This account is not authorized to access the administration console.
            Only the verified administrator account can use this dashboard.
            Sign in with an authorized account or return to the tools directory.
          </CardDescription>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/")}
              className="rounded-xl px-5 text-xs"
            >
              Return to Homepage
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  return <AdminDashboard key={user.uid} />;
}

function AdminDashboard() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[] | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const adminRequest = useRef<AbortController | null>(null);
  const feedbackRequest = useRef<AbortController | null>(null);
  const actionRequest = useRef<AbortController | null>(null);

  const fetchAdminData = useCallback(() => {
    adminRequest.current?.abort();
    const controller = new AbortController();
    adminRequest.current = controller;
    return fetch("/api/admin?section=abuse", { credentials: "same-origin", cache: "no-store", signal: controller.signal }).then(async (res) => {
      if (!res.ok) throw new Error(requestError(res.status, "Security data"));
      const data: unknown = await res.json();
      if (!isAdminData(data)) throw new Error("Security data unavailable. Invalid server response.");
      if (!controller.signal.aborted) setAdminData(data);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setAdminError(error instanceof Error ? error.message : "Security data unavailable. Try again.");
    }).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });
  }, []);

  const fetchFeedback = useCallback(() => {
    feedbackRequest.current?.abort();
    const controller = new AbortController();
    feedbackRequest.current = controller;
    return fetch("/api/feedback", { credentials: "same-origin", cache: "no-store", signal: controller.signal }).then(async (res) => {
      if (!res.ok) throw new Error(requestError(res.status, "Feedback"));
      const data = await res.json();
      if (!isFeedback(data?.feedback)) throw new Error("Feedback unavailable. Invalid server response.");
      if (!controller.signal.aborted) setFeedback(data.feedback);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setFeedbackError(error instanceof Error ? error.message : "Feedback unavailable. Try again.");
    }).finally(() => {
      if (!controller.signal.aborted) setFeedbackLoading(false);
    });
  }, []);

  const refreshAdminData = () => {
    setIsLoading(true);
    setAdminData(null);
    setAdminError(null);
    void fetchAdminData();
  };

  const refreshFeedback = () => {
    setFeedbackLoading(true);
    setFeedback(null);
    setFeedbackError(null);
    void fetchFeedback();
  };

  useEffect(() => {
    void fetchAdminData();
    void fetchFeedback();
    return () => {
      adminRequest.current?.abort();
      feedbackRequest.current?.abort();
      actionRequest.current?.abort();
    };
  }, [fetchAdminData, fetchFeedback]);

  const mutate = async (resource: "Security" | "Feedback", url: string, method: string, body?: object) => {
    if (actionRequest.current && !actionRequest.current.signal.aborted) return false;
    const controller = new AbortController();
    actionRequest.current = controller;
    setPending(true);
    setActionError(null);
    try {
      const res = await fetch(url, {
        method, credentials: "same-origin", signal: controller.signal,
        ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
      });
      if (!res.ok) {
        if (!controller.signal.aborted && (res.status === 401 || res.status === 403)) {
          if (resource === "Security") {
            adminRequest.current?.abort();
            setIsLoading(false);
            setAdminData(null);
            setAdminError(requestError(res.status, resource));
          } else {
            feedbackRequest.current?.abort();
            setFeedbackLoading(false);
            setFeedback(null);
            setFeedbackError(requestError(res.status, resource));
          }
        }
        throw new Error(requestError(res.status, resource));
      }
      const data = await res.json();
      if (data?.success !== true) throw new Error(`${resource} action failed. Invalid server response.`);
      return !controller.signal.aborted;
    } catch (error) {
      if (!controller.signal.aborted) {
        const message = error instanceof Error ? error.message : `${resource} action failed. Try again.`;
        setActionError(message);
        toast.error(message);
      }
      return false;
    } finally {
      if (!controller.signal.aborted) setPending(false);
      if (actionRequest.current === controller) actionRequest.current = null;
    }
  };

  const handleUnblockIP = async (ip: string) => {
    if (await mutate("Security", "/api/admin", "POST", { action: "unblock", ip })) {
      toast.success("IP unblocked");
      refreshAdminData();
    }
  };

  const handleFeedbackStatus = async (id: string, status: FeedbackStatus) => {
    if (await mutate("Feedback", "/api/feedback", "PATCH", { id, status })) {
      setFeedback((items) => items?.map((item) => item.id === id ? { ...item, status } : item) ?? null);
      toast.success(`Feedback marked as "${status}"`);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (await mutate("Feedback", `/api/feedback?id=${encodeURIComponent(id)}`, "DELETE")) {
      setFeedback((items) => items?.filter((item) => item.id !== id) ?? null);
      toast.success("Feedback deleted");
    }
  };

  const abuse = adminData?.abuse;
  const securityState = isLoading ? <p role="status">Loading security data...</p>
    : adminError ? <p role="alert">{adminError}</p> : null;

  return (
    <PageShell>
      {/* Header */}
      <ToolHeader icon={<Shield className="size-5" />} title="Admin Dashboard" />
      {actionError && <p role="alert" className="mb-4 text-sm text-destructive">{actionError}</p>}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <TabsList className="mb-4 flex-wrap h-auto max-w-full gap-1">
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
          <p className="mb-6 text-sm text-muted-foreground">Usage totals and trends unavailable. No reporting endpoint is connected.</p>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Security Overview
                </CardTitle>
                <Button variant="outline" size="sm" onClick={refreshAdminData} disabled={isLoading || pending}><RefreshCw />Refresh security</Button>
              </CardHeader>
              <CardContent>
                {securityState}
                {abuse && <div className="space-y-3">
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
                  <div className="flex justify-between items-center"><span className="text-sm">Active Tokens</span><span className="text-sm">{abuse.activeTokens}</span></div>
                </div>}
              </CardContent>
            </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Abuse & Security Tab */}
        {/* ================================================================ */}
        <TabsContent value="abuse">
          {securityState}
          {abuse && <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          </div>}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  Blocked IPs
                </CardTitle>
                <Button variant="outline" size="sm" onClick={refreshAdminData} disabled={isLoading || pending}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh security
                </Button>
              </div>
              <CardDescription>Manage blocked and temp-blocked IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              {adminData && (adminData.blockedIPs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No IPs currently blocked.
                </p>
              ) : (
                <div className="space-y-2">
                  {adminData.blockedIPs.map((ip) => (
                    <div key={ip} className="flex flex-wrap gap-2 items-center justify-between py-2 px-3 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono break-all">{ip}</code>
                        <Badge variant="destructive" className="text-xs">Blocked / temp-blocked</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending || isLoading}
                        onClick={() => handleUnblockIP(ip)}
                      >
                        <Unlock className="h-4 w-4 mr-1" />
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Feedback Tab */}
        {/* ================================================================ */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    User Feedback &amp; Reports
                  </CardTitle>
                  <CardDescription>Suggestions, bug reports, and general feedback from the contact form</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={refreshFeedback} disabled={feedbackLoading || pending}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${feedbackLoading ? "animate-spin" : ""}`} />
                  Refresh feedback
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {feedbackLoading ? (
                <div role="status" className="flex items-center justify-center gap-2 py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  Loading feedback...
                </div>
              ) : feedbackError ? <p role="alert">{feedbackError}</p> : feedback?.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No feedback submissions yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {feedback?.map((item) => (
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
                        <p className="text-sm whitespace-pre-wrap wrap-break-word">{item.message}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="break-all">
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
                        <div className="flex flex-wrap items-center gap-1 mt-2">
                          {item.status !== "resolved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              disabled={pending || feedbackLoading}
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
                              disabled={pending || feedbackLoading}
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
                              disabled={pending || feedbackLoading}
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
                            disabled={pending || feedbackLoading}
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
              <p className="text-sm text-muted-foreground">Tool usage and ratings unavailable. No reporting endpoint is connected.</p>
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
              <p className="text-sm text-muted-foreground text-center py-4">
                User totals and management unavailable. No admin user endpoint is connected.
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
              <p className="text-sm text-muted-foreground text-center py-4">
                Subscription totals and revenue unavailable. No admin subscription endpoint is connected.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
