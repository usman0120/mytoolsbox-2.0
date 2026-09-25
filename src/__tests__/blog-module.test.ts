import { describe, it, expect } from "vitest";
import {
  BLOG_POSTS,
  BLOG_CATEGORIES,
  getBlogPostBySlug,
  getFeaturedBlogPost,
  getRelatedBlogPosts,
} from "@/content/blog/blogs-data";
import { toolRegistry } from "@/content/tools/registry";

describe("Blog & Guides Module Data Integrity", () => {
  it("contains at least 20 comprehensive production-ready articles", () => {
    expect(BLOG_POSTS.length).toBeGreaterThanOrEqual(20);
  });

  it("has unique slugs for every article", () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("ensures every article has complete metadata, author, and cover images", () => {
    BLOG_POSTS.forEach((post) => {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.excerpt).toBeTruthy();
      expect(post.category).toBeTruthy();
      expect(post.categorySlug).toBeTruthy();
      expect(post.date).toBeTruthy();
      expect(post.isoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.readTime).toMatch(/min read/);
      expect(post.author.name).toBeTruthy();
      expect(post.author.role).toBeTruthy();
      expect(post.author.avatar).toMatch(/^https:\/\/images\.unsplash\.com/);
      expect(post.coverImage).toMatch(/^https:\/\/images\.unsplash\.com/);
      expect(post.metaTitle).toBeTruthy();
      expect(post.metaDescription).toBeTruthy();
      expect(post.keywords.length).toBeGreaterThanOrEqual(3);
      expect(post.sections.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("has a featured blog post", () => {
    const featured = getFeaturedBlogPost();
    expect(featured).toBeDefined();
    expect(featured.featured).toBe(true);
    expect(featured.slug).toBe("how-to-resize-images-without-losing-quality");
  });

  it("finds blog posts by slug correctly", () => {
    const post = getBlogPostBySlug("working-with-pdfs-without-adobe-acrobat");
    expect(post).toBeDefined();
    expect(post?.title).toContain("Working with PDFs Without Adobe Acrobat");
  });

  it("returns undefined for non-existent slug", () => {
    const post = getBlogPostBySlug("non-existent-blog-slug-404");
    expect(post).toBeUndefined();
  });

  it("returns related blog posts", () => {
    const post = BLOG_POSTS[0];
    const related = getRelatedBlogPosts(post, 3);
    expect(related.length).toBe(3);
    expect(related.every((r) => r.slug !== post.slug)).toBe(true);
  });

  it("ensures all related tools map to active or valid tools", () => {
    const allToolSlugs = new Set(toolRegistry.map((t) => t.slug));
    BLOG_POSTS.forEach((post) => {
      post.relatedTools.forEach((tool) => {
        expect(tool.name).toBeTruthy();
        expect(tool.slug).toBeTruthy();
        expect(tool.description).toBeTruthy();
      });
    });
  });

  it("has structured FAQs for search engine schema markup", () => {
    const postsWithFaq = BLOG_POSTS.filter((p) => p.faqs.length > 0);
    expect(postsWithFaq.length).toBeGreaterThanOrEqual(15);
    postsWithFaq.forEach((post) => {
      post.faqs.forEach((faq) => {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
      });
    });
  });

  it("covers key categories accurately", () => {
    const categoriesInPosts = new Set(BLOG_POSTS.map((p) => p.categorySlug));
    expect(categoriesInPosts.has("web-dev")).toBe(true);
    expect(categoriesInPosts.has("tools")).toBe(true);
    expect(categoriesInPosts.has("productivity")).toBe(true);
    expect(categoriesInPosts.has("developer")).toBe(true);
    expect(categoriesInPosts.has("security")).toBe(true);
  });
});
