"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sprout, Calculator, TrendingUp, Droplets, Calendar,
  DollarSign, Cloud, Image, MessageCircle, FlaskConical,
  Ruler, Sparkles, AlertTriangle,
} from "lucide-react";
import { CropCalculator } from "./farming/crop-calculator";
import { FertilizerCalculator } from "./farming/fertilizer-calculator";
import { LandAreaCalculator } from "./farming/land-calculator";
import { YieldCalculator } from "./farming/yield-calculator";
import { IrrigationCalculator } from "./farming/irrigation-calculator";
import { PlantingPlanner } from "./farming/planting-planner";
import { CostProfitCalculator } from "./farming/cost-profit-calculator";
import { WeatherPlanner } from "./farming/weather-planner";
import { CropImageAssistant } from "./farming/crop-image-assistant";
import { KnowledgeAssistant } from "./farming/knowledge-assistant";

const CALCULATOR_TABS = [
  { value: "crop", label: "Crop", icon: Sprout, shortLabel: "Crop" },
  { value: "fertilizer", label: "Fertilizer", icon: FlaskConical, shortLabel: "Fert." },
  { value: "land", label: "Land Area", icon: Ruler, shortLabel: "Land" },
  { value: "yield", label: "Yield", icon: TrendingUp, shortLabel: "Yield" },
  { value: "irrigation", label: "Irrigation", icon: Droplets, shortLabel: "Water" },
  { value: "planting", label: "Planting", icon: Calendar, shortLabel: "Plan" },
  { value: "cost", label: "Cost/Profit", icon: DollarSign, shortLabel: "Profit" },
];

const ASSISTANT_TABS = [
  { value: "weather", label: "Weather", icon: Cloud },
  { value: "image", label: "Crop Image", icon: Image },
  { value: "knowledge", label: "AI Assistant", icon: MessageCircle },
];

export function FarmerAIEngine() {
  const [calcTab, setCalcTab] = useState("crop");
  const [assistantTab, setAssistantTab] = useState("weather");

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Important Disclaimer</p>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/70 leading-relaxed">
            This platform provides estimates and general guidance based on agricultural science. For high-stakes decisions (pesticide application, disease treatment, livestock health), always consult your local agricultural extension officer, Krishi Vigyan Kendra (KVK), or a qualified agronomist. AI-generated advice should not replace professional diagnosis.
          </p>
        </div>
      </div>

      {/* ================================================================= */}
      {/* CALCULATORS SECTION */}
      {/* ================================================================= */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-green-600" />
            Farming Calculators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={calcTab} onValueChange={(v) => setCalcTab(v ?? "")}>
            <TabsList className="w-full overflow-x-auto flex-nowrap mb-4">
              {CALCULATOR_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs whitespace-nowrap">
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="crop"><CropCalculator /></TabsContent>
            <TabsContent value="fertilizer"><FertilizerCalculator /></TabsContent>
            <TabsContent value="land"><LandAreaCalculator /></TabsContent>
            <TabsContent value="yield"><YieldCalculator /></TabsContent>
            <TabsContent value="irrigation"><IrrigationCalculator /></TabsContent>
            <TabsContent value="planting"><PlantingPlanner /></TabsContent>
            <TabsContent value="cost"><CostProfitCalculator /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* AI ASSISTANTS SECTION */}
      {/* ================================================================= */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            AI-Powered Assistants
            <Badge className="text-[10px] h-4 px-1.5 bg-violet-500/10 text-violet-600 border-violet-500/20 rounded-full ml-1">
              AI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={assistantTab} onValueChange={(v) => setAssistantTab(v ?? "")}>
            <TabsList className="w-full overflow-x-auto flex-nowrap mb-4">
              {ASSISTANT_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs">
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="weather"><WeatherPlanner /></TabsContent>
            <TabsContent value="image"><CropImageAssistant /></TabsContent>
            <TabsContent value="knowledge"><KnowledgeAssistant /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}