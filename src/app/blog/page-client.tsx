"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BLOG_POSTS,
  BLOG_CATEGORIES,
  getFeaturedBlogPost,
} from "@/content/blog/blogs-data";
import { cn } from "@/lib/utils";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";

const POSTS_PER_PAGE = 9;

export function BlogPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const featuredPost = useMemo(() => getFeaturedBlogPost(), []);

  // Filter posts based on category and search term
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "all" || post.categorySlug === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.keywords.some((k) => k.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  return (
    <PageShell>
      {/* Top Hero Section */}
      <section className="border-b border-border pb-5">
        <div>
          <div className="space-y-4">
            {/* Top Pill Badge matching Screenshot 1 */}
            <ToolHeader icon={<BookOpen className="h-5 w-5" />} title="Blog & Guides" description="Practical guides for tools, web development, and digital workflows." />

            {/* Search Input Bar */}
            <div className="w-full max-w-xl pt-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  aria-label="Search articles"
                  placeholder="Search guides, tools, and technical topics..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-14 h-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear article search"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 max-w-3xl">
              {BLOG_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryChange(cat.slug)}
                    aria-pressed={isActive}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="py-6 space-y-8">
        {/* Large Featured Post Banner (Visible when no specific search query is active) */}
        {!searchQuery && selectedCategory === "all" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span>Featured Article</span>
            </div>

            <Card className="overflow-hidden border border-border/60 bg-card hover:border-primary/40 transition-all duration-300 shadow-md group">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Image Section */}
                <div className="relative lg:col-span-7 h-48 sm:h-56 lg:h-auto overflow-hidden bg-muted">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wide px-2.5 py-0.5 shadow-sm">
                      FEATURED
                    </Badge>
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-xs font-medium text-xs">
                      {featuredPost.category}
                    </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {featuredPost.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {featuredPost.readTime}
                      </span>
                    </div>

                    <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      <Link href={`/blog/${featuredPost.slug}`}>
                        {featuredPost.title}
                      </Link>
                    </h2>

                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-3 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className={cn(buttonVariants({ variant: "default" }), "gap-2 group-hover:translate-x-0.5 transition-transform")}
                    >
                      <span>Read article</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {searchQuery ? `Search Results (${filteredPosts.length})` : "All Articles & Guides"}
            </h3>
            <span className="text-xs text-muted-foreground">
              Showing {paginatedPosts.length} of {filteredPosts.length} guides
            </span>
          </div>

          {paginatedPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center space-y-4">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-foreground">No articles found</h4>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search keywords or choosing a different category filter.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedPosts.map((post) => (
                <Card
                  key={post.slug}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card hover:border-primary/40 transition-colors"
                >
                  {/* Card Cover Image */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative aspect-[16/10] overflow-hidden bg-muted block"
                  >
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-background/90 text-foreground backdrop-blur-xs font-semibold text-[11px] shadow-xs">
                        {post.category}
                      </Badge>
                    </div>
                  </Link>

                  {/* Card Body */}
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{post.date}</span>
                        <span>•</span>
                        <Clock className="h-3.5 w-3.5" />
                        <span>{post.readTime}</span>
                      </div>

                      <h4 className="font-bold text-base sm:text-lg leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h4>

                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Bottom Row */}
                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">
                        {post.author.name}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Read More</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 px-2 text-sm text-muted-foreground">
                Page <span className="font-semibold text-foreground px-1">{currentPage}</span> of{" "}
                {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Deep Emerald Green Bottom CTA Banner matching Screenshot 1 */}
        <section className="border-t border-border pt-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-base font-semibold">Tools & Resources</h3>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/tools"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2"
                )}
              >
                <span>Browse Tools</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/resources"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "font-medium"
                )}
              >
                <span>View Resources</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
