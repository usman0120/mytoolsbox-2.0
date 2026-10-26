import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BLOG_POSTS,
  getBlogPostBySlug,
  type BlogPost,
} from "@/content/blog/blogs-data";
import { BlogPostClient } from "./page-client";
import { SITE_CONFIG } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | MyToolsBox",
    };
  }

  const url = `${SITE_CONFIG.url}/blog/${post.slug}`;

  return {
    title: `${post.title} | MyToolsBox Blog`,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.isoDate,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // JSON-LD Structured Data for Article & FAQ
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${SITE_CONFIG.url}/blog/${post.slug}#article`,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${SITE_CONFIG.url}/#website`,
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.url,
        },
        headline: post.title,
        description: post.metaDescription,
        image: post.coverImage,
        datePublished: post.isoDate,
        dateModified: post.isoDate,
        author: {
          "@type": "Person",
          name: post.author.name,
          jobTitle: post.author.role,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.url,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_CONFIG.url}/logo.png`,
          },
        },
        mainEntityOfPage: `${SITE_CONFIG.url}/blog/${post.slug}`,
      },
      ...(post.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${SITE_CONFIG.url}/blog/${post.slug}#faq`,
              mainEntity: post.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient post={post} />
    </>
  );
}
