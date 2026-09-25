"use client";

import { useState } from "react";
import {
  MessageSquare,
  RefreshCw,
  Copy,
  Check,
  Hash,
  Sparkles,
  Download,
  Share2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCredits } from "@/lib/credits/use-credits";
import { completeViaServer } from "@/lib/ai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PLATFORM_CONFIGS,
  CONTENT_TYPES,
  HASHTAG_SUGGESTIONS,
  generatePostContent,
  SocialMediaPost,
} from "@/features/tools/social-media-content-generator";
import { toast } from "sonner";

export function SocialMediaContentGeneratorEngine() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("LinkedIn");
  const [contentType, setContentType] = useState("Educational");
  const [industry, setIndustry] = useState("Tech");
  const [callToAction, setCallToAction] = useState("");
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { refresh } = useCredits();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or product announcement.");
      return;
    }
    setIsLoading(true);

    try {
      const prompt = `Create a viral, high-converting ${platform} post about: "${topic}".\nContent Angle: ${contentType}\nIndustry: ${industry}${callToAction ? `\nCall to action: ${callToAction}` : ""}\nFormat with engaging line breaks, emojis, and include 3-5 relevant hashtags at the end.`;

      const aiRes = await completeViaServer({
        systemPrompt: `You are an elite social media strategist and copywriter specialized in ${platform}. Write catchy, punchy posts optimized for high engagement and impressions.`,
        prompt,
        tier: "cheap",
        operation: "simple_rewrite",
        temperature: 0.7,
      });

      if (aiRes?.text) {
        const text = aiRes.text.trim();
        const extractedHashtags = (text.match(/#[a-zA-Z0-9_]+/g) || []).slice(0, 5);
        const cleanContent = text.replace(/#[a-zA-Z0-9_]+/g, "").trim();

        const newPost: SocialMediaPost = {
          id: `post_${Date.now()}`,
          platform,
          content: cleanContent || text,
          hashtags: extractedHashtags.length > 0 ? extractedHashtags : [`#${industry.replace(/\s+/g, "")}`, `#${contentType.replace(/\s+/g, "")}`, "#Innovation"],
          contentType,
          characterCount: text.length,
        };

        setPosts([newPost, ...posts]);
        toast.success(`Generated ${platform} post!`);
        await refresh();
      } else {
        throw new Error("Empty response");
      }
    } catch {
      const fallbackPost = generatePostContent(
        topic,
        platform,
        contentType,
        industry,
        callToAction
      );
      setPosts([fallbackPost, ...posts]);
      toast.info(`Generated via offline template engine.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = (post: SocialMediaPost) => {
    const full = `${post.content}\n\n${post.hashtags.join(" ")}`;
    const blob = new Blob([full], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `post-${post.platform.toLowerCase()}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded post text file!");
  };

  const platformConfig = PLATFORM_CONFIGS[platform];

  return (
    <div className="space-y-6">
      {/* Configuration Form Card */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold mb-1 block">Topic or Announcement</Label>
            <Input
              placeholder="e.g. Launching our AI Code Reviewer, 5 Remote Work Lessons..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-9"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1 block">Target Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v || "LinkedIn")}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PLATFORM_CONFIGS).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PLATFORM_CONFIGS[p].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1 block">Content Angle</Label>
            <Select value={contentType} onValueChange={(v) => setContentType(v || "Educational")}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((ct) => (
                  <SelectItem key={ct} value={ct}>
                    {ct}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1 block">Niche / Industry</Label>
            <Select value={industry} onValueChange={(v) => setIndustry(v || "Tech")}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(HASHTAG_SUGGESTIONS).map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Label className="text-xs font-semibold mb-1 block">
              Call-to-Action / Link Note (Optional)
            </Label>
            <Input
              placeholder="e.g. Try it for free at example.com | Link in bio | Comment 'send' for the guide"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        <Button onClick={handleGenerate} className="w-full gap-2 font-medium" disabled={!topic.trim() || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Craft Social Media Post
        </Button>
      </div>

      {/* Generated Feed */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-primary" /> Generated Posts ({posts.length})
            </span>
          </div>

          {posts.map((post) => {
            const config = PLATFORM_CONFIGS[post.platform];
            const fullContent = `${post.content}\n\n${post.hashtags.join(" ")}`;
            const isOverLimit = post.content.length > (config?.maxChars || 5000);

            return (
              <Card key={post.id} className="shadow-xs overflow-hidden">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-semibold text-xs">
                      {post.platform}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {post.contentType}
                    </Badge>
                    {config && (
                      <span
                        className={`text-xs font-mono ml-2 ${
                          isOverLimit ? "text-destructive font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        {post.content.length} / {config.maxChars} chars
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(post.id, fullContent)}
                      className="gap-1 h-7 text-xs"
                    >
                      {copied === post.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy Post + Tags
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(post)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Download as text file"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed font-sans">
                    {post.content}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                    {post.hashtags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs font-mono bg-muted text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleCopy(tag, tag)}
                        title="Click to copy hashtag"
                      >
                        <Hash className="h-3 w-3 mr-0.5" />
                        {tag.replace("#", "")}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}