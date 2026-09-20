"use client";

import { useState } from "react";
import { Globe, Copy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function IPLookupEngine() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://ipapi.co/${ip || ""}/json/`);
      const data = await res.json();
      if (data.error) { toast.error("Invalid IP or lookup failed"); setResult(null); }
      else setResult(data);
    } catch {
      toast.error("Network error");
    } finally { setLoading(false); }
  };

  const getMyIP = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      setIp(data.ip);
      await lookup();
    } catch { toast.error("Failed to get IP"); setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">IP Lookup</Badge>
        <span className="text-xs text-muted-foreground">Get geolocation & ISP info for any IP</span>
      </div>

      <div className="flex gap-2">
        <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="8.8.8.8" className="flex-1 px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <Button onClick={lookup} disabled={loading} className="gap-2 rounded-xl"><Search className="h-4 w-4" />Lookup</Button>
      </div>

      <Button variant="outline" size="sm" onClick={getMyIP} disabled={loading} className="rounded-xl text-xs w-full">Get My IP</Button>

      {result && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "IP", value: result.ip },
            { label: "City", value: result.city },
            { label: "Region", value: result.region },
            { label: "Country", value: result.country_name },
            { label: "ISP", value: result.org },
            { label: "Timezone", value: result.timezone },
            { label: "Postal", value: result.postal },
            { label: "Lat/Lon", value: `${result.latitude}, ${result.longitude}` },
          ].filter(f => f.value).map(f => (
            <div key={f.label} className="p-3 bg-muted/30 rounded-xl">
              <div className="text-xs text-muted-foreground">{f.label}</div>
              <div className="text-sm font-medium truncate">{f.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}