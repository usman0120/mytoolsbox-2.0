"use client";

import { useState } from "react";
import { MessageSquare, RefreshCw, Copy, Check, Hash, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PLATFORM_CONFIGS,
  CONTENT_TYPES,
  HASHTAG_SUGGESTIONS,
  generatePostContent,
  SocialMediaPost,
} from "@/features/tools/social-media-content-generator";

export function SocialMediaContentGeneratorEngine() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("LinkedIn");
  const [contentType, setContentType] = useState("Promotional");
  const [industry, setIndustry] = useState("Tech");
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    const newPost = generatePostContent(topic, platform, contentType, industry);
    setPosts([newPost, ...posts]);
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const platformConfig = PLATFORM_CONFIGS[platform];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Topic / Product</Label>
          <Input placeholder="e.g. New SaaS launch, Summer sale..." value={topic} onChange={e => setTopic(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Platform</Label>
          <Select value={platform} onValueChange={(v) => setPlatform(v || "LinkedIn")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(PLATFORM_CONFIGS).map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Content Type</Label>
          <Select value={contentType} onValueChange={(v) => setContentType(v || "Promotional")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map(ct => (
                <SelectItem key={ct} value={ct}>{ct}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Industry</Label>
          <Select value={industry} onValueChange={(v) => setIndustry(v || "Tech")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(HASHTAG_SUGGESTIONS).map(ind => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleGenerate} className="w-full gap-2" disabled={!topic.trim()}>
        <Sparkles className="h-4 w-4" /> Generate Post
      </Button>

      {posts.length > 0 && (
        <div className="space-y-3">
          {posts.map(post => (
            <Card key={post.id}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{post.platform}</Badge>
                  <Badge variant="outline">{post.contentType}</Badge>
                  {platformConfig && (
                    <span className="text-xs text-muted-foreground">
                      {post.content.length}/{platformConfig.maxChars}
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(post.id, `${post.content}\n\n${post.hashtags.join(" ")}`)}>
                  {copied === post.id ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied === post.id ? "Copied" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Hash className="h-3 w-3 mr-0.5" />{tag.replace("#", "")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}