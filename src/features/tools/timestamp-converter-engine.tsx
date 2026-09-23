"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Copy,
  Check,
  Calendar,
  Globe,
  Play,
  Pause,
  ArrowRightLeft,
  CalendarDays,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  parseTimestampOrDate,
  MAJOR_TIMEZONES,
  ParsedTimestampData,
} from "@/features/tools/timestamp-converter";
import { toast } from "sonner";

export function TimestampConverterEngine() {
  const [activeTab, setActiveTab] = useState<"epoch-to-date" | "date-to-epoch">("epoch-to-date");

  // Live ticking clock state
  const [currentEpoch, setCurrentEpoch] = useState(() => Math.floor(Date.now() / 1000));
  const [isLiveRunning, setIsLiveRunning] = useState(true);

  // Tab 1 state
  const [inputVal, setInputVal] = useState(() => String(Math.floor(Date.now() / 1000)));

  // Tab 2 date-time picker state
  const [humanYear, setHumanYear] = useState(() => new Date().getUTCFullYear());
  const [humanMonth, setHumanMonth] = useState(() => new Date().getUTCMonth() + 1);
  const [humanDay, setHumanDay] = useState(() => new Date().getUTCDate());
  const [humanHour, setHumanHour] = useState(() => new Date().getUTCHours());
  const [humanMin, setHumanMin] = useState(() => new Date().getUTCMinutes());
  const [humanSec, setHumanSec] = useState(() => new Date().getUTCSeconds());

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live timer interval
  useEffect(() => {
    if (!isLiveRunning) return;
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveRunning]);

  // Derived parsed timestamp for Tab 1
  const parsedData = useMemo(() => {
    return parseTimestampOrDate(inputVal);
  }, [inputVal]);

  // Derived timestamp from Tab 2
  const customDateTimestamp = useMemo(() => {
    const d = new Date(Date.UTC(humanYear, humanMonth - 1, humanDay, humanHour, humanMin, humanSec));
    if (isNaN(d.getTime())) return null;
    return {
      sec: Math.floor(d.getTime() / 1000),
      ms: d.getTime(),
      iso: d.toISOString(),
      utc: d.toUTCString(),
    };
  }, [humanYear, humanMonth, humanDay, humanHour, humanMin, humanSec]);

  const handleCopy = async (val: string, key: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleSetNow = () => {
    const nowSec = Math.floor(Date.now() / 1000);
    setInputVal(String(nowSec));
    const now = new Date();
    setHumanYear(now.getUTCFullYear());
    setHumanMonth(now.getUTCMonth() + 1);
    setHumanDay(now.getUTCDate());
    setHumanHour(now.getUTCHours());
    setHumanMin(now.getUTCMinutes());
    setHumanSec(now.getUTCSeconds());
  };

  const handleOffset = (seconds: number) => {
    if (parsedData.success && parsedData.data) {
      const newSec = parsedData.data.unixSeconds + seconds;
      setInputVal(String(newSec));
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Ticking Epoch Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isLiveRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isLiveRunning ? "bg-green-500" : "bg-muted-foreground"}`} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Unix Epoch
            </span>
            <Badge variant="outline" className="font-mono text-xs">
              {currentEpoch}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleCopy(String(currentEpoch), "epoch-now")}
            >
              {copiedKey === "epoch-now" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              Copy Epoch
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsLiveRunning(!isLiveRunning)}
              title={isLiveRunning ? "Pause live counter" : "Resume live counter"}
            >
              {isLiveRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "epoch-to-date" | "date-to-epoch")}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <TabsList>
            <TabsTrigger value="epoch-to-date" className="gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" /> Timestamp &rarr; Human Date
            </TabsTrigger>
            <TabsTrigger value="date-to-epoch" className="gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" /> Human Date &rarr; Timestamp
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" onClick={handleSetNow} className="h-8 text-xs gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Set Current Time
          </Button>
        </div>

        {/* Tab 1: Timestamp to Date */}
        <TabsContent value="epoch-to-date" className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Enter Timestamp or Date String</Label>
            <div className="flex gap-2">
              <Input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. 1740000000 or 1740000000000 or 2025-05-15T12:00:00Z"
                className="font-mono text-sm h-10"
              />
              <Button
                variant="outline"
                className="h-10 text-xs px-4"
                onClick={() => setInputVal(String(Math.floor(Date.now() / 1000)))}
              >
                Now
              </Button>
            </div>

            {/* Quick Math adjustments */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-muted-foreground mr-1">Quick adjust:</span>
              <button
                type="button"
                onClick={() => handleOffset(3600)}
                className="px-2 py-0.5 rounded bg-muted hover:bg-primary/10 border text-[11px]"
              >
                +1 hour
              </button>
              <button
                type="button"
                onClick={() => handleOffset(-3600)}
                className="px-2 py-0.5 rounded bg-muted hover:bg-primary/10 border text-[11px]"
              >
                -1 hour
              </button>
              <button
                type="button"
                onClick={() => handleOffset(86400)}
                className="px-2 py-0.5 rounded bg-muted hover:bg-primary/10 border text-[11px]"
              >
                +1 day
              </button>
              <button
                type="button"
                onClick={() => handleOffset(-86400)}
                className="px-2 py-0.5 rounded bg-muted hover:bg-primary/10 border text-[11px]"
              >
                -1 day
              </button>
              <button
                type="button"
                onClick={() => handleOffset(604800)}
                className="px-2 py-0.5 rounded bg-muted hover:bg-primary/10 border text-[11px]"
              >
                +1 week
              </button>
            </div>
          </div>

          {parsedData.success && parsedData.data ? (
            <div className="space-y-4">
              {/* Formats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "ISO 8601", val: parsedData.data.iso8601, key: "iso" },
                  { label: "UTC / GMT String", val: parsedData.data.utcString, key: "utc" },
                  { label: "Unix Epoch (Seconds)", val: String(parsedData.data.unixSeconds), key: "sec" },
                  { label: "Unix Epoch (Milliseconds)", val: String(parsedData.data.unixMilliseconds), key: "ms" },
                  { label: "Local Time (Browser)", val: parsedData.data.localString, key: "local" },
                  { label: "Relative Time", val: parsedData.data.relative, key: "rel" },
                ].map((item) => (
                  <Card key={item.key} className="bg-muted/20">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[11px] font-semibold text-muted-foreground block">
                          {item.label}
                        </span>
                        <span className="font-mono text-xs font-medium truncate block select-all">
                          {item.val}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleCopy(item.val, item.key)}
                      >
                        {copiedKey === item.key ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Extra Date Details */}
              <div className="p-4 rounded-xl border bg-muted/10">
                <span className="text-xs font-semibold text-muted-foreground block mb-2">Calendar Attributes</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Day of Week</span>
                    <span className="font-semibold">{parsedData.data.dayOfWeek}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Day of Year</span>
                    <span className="font-semibold">{parsedData.data.dayOfYear} of 365</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">ISO Week</span>
                    <span className="font-semibold">Week #{parsedData.data.weekNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Leap Year</span>
                    <span className="font-semibold">{parsedData.data.isLeapYear ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              {/* World Timezones */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Global World Timezones
                </span>
                <div className="border rounded-xl divide-y text-xs overflow-hidden">
                  {MAJOR_TIMEZONES.map((tz) => {
                    const d = new Date(parsedData.data!.unixMilliseconds);
                    const formattedTz = d.toLocaleString("en-US", {
                      timeZone: tz.zone,
                      dateStyle: "medium",
                      timeStyle: "medium",
                    });

                    return (
                      <div key={tz.zone} className="flex items-center justify-between p-2.5 hover:bg-muted/20">
                        <span className="text-muted-foreground">{tz.label}</span>
                        <span className="font-mono font-medium">{formattedTz}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-xs">
              {parsedData.error}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Human Date to Timestamp */}
        <TabsContent value="date-to-epoch" className="space-y-4 pt-3">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div>
              <Label className="text-xs">Year (UTC)</Label>
              <Input
                type="number"
                value={humanYear}
                onChange={(e) => setHumanYear(parseInt(e.target.value) || 2025)}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Month (1-12)</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={humanMonth}
                onChange={(e) => setHumanMonth(parseInt(e.target.value) || 1)}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Day (1-31)</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={humanDay}
                onChange={(e) => setHumanDay(parseInt(e.target.value) || 1)}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Hour (0-23)</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={humanHour}
                onChange={(e) => setHumanHour(parseInt(e.target.value) || 0)}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Minute (0-59)</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={humanMin}
                onChange={(e) => setHumanMin(parseInt(e.target.value) || 0)}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Second (0-59)</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={humanSec}
                onChange={(e) => setHumanSec(parseInt(e.target.value) || 0)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          {customDateTimestamp && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Card className="bg-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block">Epoch Seconds</span>
                    <span className="font-mono font-bold text-lg">{customDateTimestamp.sec}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={() => handleCopy(String(customDateTimestamp.sec), "custom-sec")}
                  >
                    {copiedKey === "custom-sec" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block">Epoch Milliseconds</span>
                    <span className="font-mono font-bold text-lg">{customDateTimestamp.ms}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={() => handleCopy(String(customDateTimestamp.ms), "custom-ms")}
                  >
                    {copiedKey === "custom-ms" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}