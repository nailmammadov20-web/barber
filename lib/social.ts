export type SocialPlatform = "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "FACEBOOK";

export const SOCIAL_PLATFORMS: SocialPlatform[] = ["INSTAGRAM", "TIKTOK", "YOUTUBE", "FACEBOOK"];

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  FACEBOOK: "Facebook",
};

/** Representative brand accent color, used for the live badge and icon highlight. */
export const SOCIAL_COLORS: Record<SocialPlatform, string> = {
  INSTAGRAM: "#E1306C",
  TIKTOK: "#FE2C55",
  YOUTUBE: "#FF0000",
  FACEBOOK: "#1877F2",
};

/** Background used for the avatar frame when the barber is live on that platform. */
export const SOCIAL_GRADIENTS: Record<SocialPlatform, string> = {
  INSTAGRAM: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)",
  TIKTOK: "linear-gradient(135deg, #25F4EE, #FE2C55)",
  YOUTUBE: "#FF0000",
  FACEBOOK: "#1877F2",
};
