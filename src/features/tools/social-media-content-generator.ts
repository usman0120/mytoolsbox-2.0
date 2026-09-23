export interface SocialMediaPost {
  id: string;
  platform: string;
  content: string;
  hashtags: string[];
  contentType: string;
  characterCount: number;
}

export const PLATFORM_CONFIGS: Record<
  string,
  { maxChars: number; hashtagLimit: number; tone: string; name: string }
> = {
  "Twitter/X": { maxChars: 280, hashtagLimit: 3, tone: "punchy, concise, high-impact", name: "Twitter / X" },
  "LinkedIn": { maxChars: 3000, hashtagLimit: 5, tone: "professional, visionary, storytelling", name: "LinkedIn" },
  "Instagram": { maxChars: 2200, hashtagLimit: 15, tone: "visually evocative, emoji-friendly", name: "Instagram" },
  "Facebook": { maxChars: 63206, hashtagLimit: 3, tone: "conversational, community-focused", name: "Facebook" },
  "TikTok": { maxChars: 2200, hashtagLimit: 6, tone: "hook-first, energetic, casual", name: "TikTok" },
};

export const CONTENT_TYPES = [
  "Promotional",
  "Educational",
  "Behind-the-scenes",
  "Testimonial",
  "Industry News",
  "Tips & Tricks",
  "Question/Poll",
  "Storytelling",
];

export const HASHTAG_SUGGESTIONS: Record<string, string[]> = {
  "Tech": ["#TechTrends", "#Innovation", "#AI", "#SoftwareDev", "#BuildInPublic", "#SaaS", "#CloudComputing"],
  "Finance": ["#Finance", "#Investing", "#WealthBuilding", "#Fintech", "#Crypto", "#PersonalFinance"],
  "Marketing": ["#Marketing", "#DigitalMarketing", "#GrowthHacking", "#ContentStrategy", "#Branding"],
  "Health": ["#Health", "#Wellness", "#Mindfulness", "#HealthyLiving", "#Fitness", "#SelfCare"],
  "Food": ["#Foodie", "#CulinaryArt", "#EatLocal", "#FoodInspo", "#RecipeShare"],
  "Real Estate": ["#RealEstate", "#PropertyInvestment", "#HousingMarket", "#Architecture", "#RealtorLife"],
  "Fashion": ["#Fashion", "#StyleInspo", "#OOTD", "#SustainableFashion", "#CapsuleWardrobe"],
  "Education": ["#Education", "#LifelongLearning", "#EdTech", "#SkillBuilding", "#StudyMotivation"],
};

export function generatePostId(): string {
  return `post-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

export function generateHashtags(industry: string, count: number = 5): string[] {
  const suggestions = HASHTAG_SUGGESTIONS[industry] || Object.values(HASHTAG_SUGGESTIONS).flat();
  const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generatePostContent(
  topic: string,
  platform: string,
  contentType: string,
  industry: string,
  callToAction?: string
): SocialMediaPost {
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS["LinkedIn"];
  const hashtags = generateHashtags(industry, config.hashtagLimit);
  const cta = callToAction?.trim() || "What are your thoughts on this? Let's discuss below 👇";

  let body = "";

  if (platform === "Twitter/X") {
    // Keep tightly under 280 chars
    switch (contentType) {
      case "Tips & Tricks":
        body = `3 quick rules for mastering ${topic}:\n\n1. Start small and iterate daily\n2. Prioritize quality over noise\n3. Measure real outcome, not vanity\n\nSave this for reference 📌`;
        break;
      case "Educational":
        body = `The biggest misconception about ${topic}?\n\nPeople think it takes months to see results.\n\nIn reality, doing the fundamentals right yields compounding wins in 14 days.`;
        break;
      case "Question/Poll":
        body = `Honest question for the timeline:\n\nWhat is your #1 friction point with ${topic} right now?\n\nReplying to everyone today 👇`;
        break;
      default:
        body = `We just took a huge step forward with ${topic}.\n\nBuilt for speed, clarity, and results.\n\nCheck out the launch thread below 🧵`;
    }
  } else if (platform === "LinkedIn") {
    // Rich storytelling with spacing
    switch (contentType) {
      case "Educational":
        body = `Most professionals approach ${topic} the wrong way.\n\nThey focus on quick shortcuts instead of sustainable architecture.\n\nHere are 3 core pillars we've discovered after working with industry leaders:\n\n1. Foundational Clarity: Understand the problem before choosing tooling.\n2. Iterative Feedback: Deploy in small batches and adapt quickly.\n3. Measurable Impact: Track metrics that actually shift the needle.\n\n${cta}`;
        break;
      case "Storytelling":
        body = `A year ago, our approach to ${topic} looked completely different.\n\nWe faced setbacks, tested hypotheses, and completely redesigned our workflow.\n\nHere is what that journey taught us:\n• Simplicity consistently beats complex overengineering\n• Consistent execution outperforms raw talent\n• Transparency with your team builds lasting trust\n\nIf you are currently navigating ${topic}, keep pushing forward.\n\n${cta}`;
        break;
      default:
        body = `Excited to announce our latest milestone in ${topic}.\n\nOver the past few months, we've focused relentlessly on solving real pain points for our community.\n\nKey Highlights:\n• Streamlined workflow designed for speed and reliability\n• Built-in automation to eliminate redundant manual work\n• Seamless integration with existing toolsets\n\n${cta}`;
    }
  } else if (platform === "Instagram") {
    // Visual emoji structure
    body = `✨ Diving deep into ${topic} ✨\n\n` +
      `Here is your daily reminder that small consistent improvements lead to massive long-term transformation.\n\n` +
      `💡 Key Takeaways:\n` +
      `👉 Master the fundamentals first\n` +
      `👉 Stay consistent even when motivation dips\n` +
      `👉 Protect your creative focus\n\n` +
      `💬 Double tap if this resonates & tag someone who needs to see this!`;
  } else {
    // Facebook / TikTok
    body = `Let's talk about ${topic}! 🔥\n\n` +
      `Whether you are just getting started or looking to level up your existing system, here is the roadmap that will save you hours of trial and error.\n\n` +
      `${cta}`;
  }

  return {
    id: generatePostId(),
    platform,
    content: body,
    hashtags,
    contentType,
    characterCount: body.length,
  };
}