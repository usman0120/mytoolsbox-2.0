"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Wind, Thermometer, Droplets, Calculator, AlertTriangle, CheckCircle, Sun, CloudLightning } from "lucide-react";
import { analyzeWeather, getCropList, type WeatherAdvice } from "@/lib/farming/engine";

const FORECASTS = [
  { value: "sunny", label: "Sunny", icon: Sun },
  { value: "cloudy", label: "Cloudy", icon: Cloud },
  { value: "rainy", label: "Rainy", icon: CloudRain },
  { value: "stormy", label: "Stormy", icon: CloudLightning },
];

export function WeatherPlanner() {
  const [crop, setCrop] = useState("");
  const [temperature, setTemperature] = useState("30");
  const [humidity, setHumidity] = useState("60");
  const [rainfall, setRainfall] = useState("0");
  const [windSpeed, setWindSpeed] = useState("10");
  const [forecast, setForecast] = useState("sunny");
  const [result, setResult] = useState<WeatherAdvice | null>(null);

  const crops = getCropList();

  const handleAnalyze = () => {
    const r = analyzeWeather(
      crop || "",
      parseFloat(temperature) || 30,
      parseFloat(humidity) || 60,
      parseFloat(rainfall) || 0,
      parseFloat(windSpeed) || 10,
      forecast as "sunny" | "cloudy" | "rainy" | "stormy",
    );
    setResult(r);
  };

  const riskBadge = (level: string) => {
    switch (level) {
      case "low": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Low Risk</Badge>;
      case "medium": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><AlertTriangle className="h-3 w-3 mr-1" />Medium Risk</Badge>;
      case "high": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><AlertTriangle className="h-3 w-3 mr-1" />High Risk</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Thermometer className="h-3 w-3" /> Temp (°C)</Label>
          <Input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Droplets className="h-3 w-3" /> Humidity (%)</Label>
          <Input type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} min="0" max="100" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><CloudRain className="h-3 w-3" /> Rain (mm)</Label>
          <Input type="number" value={rainfall} onChange={(e) => setRainfall(e.target.value)} min="0" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Wind className="h-3 w-3" /> Wind (km/h)</Label>
          <Input type="number" value={windSpeed} onChange={(e) => setWindSpeed(e.target.value)} min="0" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Forecast</Label>
          <Select value={forecast} onValueChange={(v) => setForecast(v ?? "")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORECASTS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Crop (optional)</Label>
          <Select value={crop} onValueChange={(v) => setCrop(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Any crop" />
            </SelectTrigger>
            <SelectContent>
              {crops.map((c) => (
                <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleAnalyze} className="w-full gap-2 bg-green-600 hover:bg-green-700">
        <Calculator className="h-4 w-4" /> Analyze Weather
      </Button>

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-sm">
                {result.suitable ? "Conditions are favorable" : "Conditions are challenging"}
              </span>
            </div>
            {riskBadge(result.riskLevel)}
          </div>

          {/* Soil Moisture */}
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
            <p className="text-xs text-muted-foreground mb-1">Soil Moisture</p>
            <p className="text-sm">{result.soilMoistureAdvice}</p>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
              <p className="text-xs font-medium mb-2 text-amber-700">Recommendations</p>
              <ul className="space-y-1">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-amber-500 shrink-0">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Best Activities */}
          {result.bestActivities.length > 0 && (
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
              <p className="text-xs font-medium mb-2 text-green-700 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Best Activities
              </p>
              <ul className="space-y-1">
                {result.bestActivities.map((a, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-green-500 shrink-0">•</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Avoid Activities */}
          {result.avoidActivities.length > 0 && (
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
              <p className="text-xs font-medium mb-2 text-red-700 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Avoid
              </p>
              <ul className="space-y-1">
                {result.avoidActivities.map((a, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-red-500 shrink-0">•</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}