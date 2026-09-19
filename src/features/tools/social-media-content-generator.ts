export interface SocialMediaPost {
  id: string;
  platform: string;
  content: string;
  hashtags: string[];
  contentType: string;
}

export const PLATFORM_CONFIGS: Record<string, { maxChars: number; hashtagLimit: number; tone: string }> = {
  "Twitter/X": { maxChars: 280, hashtagLimit: 3, tone: "concise and punchy" },
  "LinkedIn": { maxChars: 3000, hashtagLimit: 5, tone: "professional and insightful" },
  "Instagram": { maxChars: 2200, hashtagLimit: 30, tone: "engaging and visual" },
  "Facebook": { maxChars: 63206, hashtagLimit: 3, tone: "conversational and friendly" },
  "TikTok": { maxChars: 2200, hashtagLimit: 5, tone: "trendy and energetic" },
};

export const CONTENT_TYPES = [
  "Promotional", "Educational", "Behind-the-scenes", "Testimonial",
  "Industry News", "Tips & Tricks", "Question/Poll", "Storytelling",
];

export const HASHTAG_SUGGESTIONS: Record<string, string[]> = {
  "Tech": ["#TechTrends", "#Innovation", "#DigitalTransformation", "#TechNews", "#StartupLife"],
  "Finance": ["#Finance", "#Investing", "#MoneyMatters", "#FinancialFreedom", "#WealthBuilding"],
  "Marketing": ["#Marketing", "#DigitalMarketing", "#SocialMedia", "#BrandStrategy", "#ContentMarketing"],
  "Health": ["#Health", "#Wellness", "#SelfCare", "#HealthyLiving", "#Fitness"],
  "Food": ["#Foodie", "#FoodPhotography", "#Restaurant", "#Yummy", "#HomeCooking"],
  "Real Estate": ["#RealEstate", "#HomeForSale", "#PropertyInvestment", "#DreamHome", "#Realtor"],
  "Fashion": ["#Fashion", "#Style", "#OOTD", "#FashionBlogger", "#Trendy"],
  "Education": ["#Education", "#Learning", "#OnlineLearning", "#EdTech", "#Knowledge"],
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
  industry: string
): SocialMediaPost {
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS["LinkedIn"];
  const hashtags = generateHashtags(industry, config.hashtagLimit);

  const templates: Record<string, string[]> = {
    "Promotional": [
      `Excited to share our latest update on ${topic}! 🚀 We've been working hard to bring you the best experience. Check it out and let us know what you think!`,
      `Looking for the best ${topic} solution? We've got you covered. Our team has crafted something special just for you.`,
    ],
    "Educational": [
      `Did you know? ${topic} is transforming the way businesses operate. Here are 3 key insights you need to know:\n\n1. It saves time and resources\n2. It improves efficiency\n3. It drives growth\n\nLearn more on our blog!`,
      `Understanding ${topic} doesn't have to be complicated. Here's a simple breakdown of what you need to know.`,
    ],
    "Behind-the-scenes": [
      `Ever wonder what goes into ${topic}? Here's a peek behind the curtain at our process. It takes dedication, creativity, and a lot of coffee! ☕`,
      `Our team hard at work on ${topic}. We believe in transparency and quality in everything we do.`,
    ],
    "Testimonial": [
      `"The ${topic} service exceeded our expectations!" - Happy Client\n\nWe love hearing feedback from our customers. Your success is our success!`,
      `Another satisfied customer! Thanks for trusting us with your ${topic} needs. ⭐⭐⭐⭐⭐`,
    ],
    "Industry News": [
      `Big changes coming to the ${topic} industry! Here's what you need to know to stay ahead of the curve.`,
      `Breaking: New developments in ${topic} that could reshape the industry. Our analysis inside.`,
    ],
    "Tips & Tricks": [
      `5 quick tips to master ${topic}:\n1. Start with the basics\n2. Practice consistently\n3. Learn from experts\n4. Stay updated\n5. Measure results\n\nSave this for later! 📌`,
      `Pro tip for ${topic}: Always start with a clear strategy. Here's our proven framework.`,
    ],
    "Question/Poll": [
      `What's your biggest challenge with ${topic}? We'd love to hear from you! Drop your thoughts in the comments. 👇`,
      `Poll: How important is ${topic} to your business?\nA) Essential\nB) Important\nC) Nice to have\nD) Not relevant`,
    ],
    "Storytelling": [
      `When we started working on ${topic}, we had no idea it would lead us here. Here's our journey and what we learned along the way.`,
      `Every great ${topic} story starts with a problem. Here's how we solved ours.`,
    ],
  };

  const options = templates[contentType] || templates["Promotional"];
  const content = options[Math.floor(Math.random() * options.length)];

  return {
    id: generatePostId(),
    platform,
    content,
    hashtags,
    contentType,
  };
}