import { FacebookIcon, InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/icons/social";
import { SOCIAL_COLORS, SOCIAL_LABELS, SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/social";
import { cn } from "@/lib/utils";

const PLATFORM_ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  INSTAGRAM: InstagramIcon,
  TIKTOK: TiktokIcon,
  YOUTUBE: YoutubeIcon,
  FACEBOOK: FacebookIcon,
};

export function SocialLinks({
  links,
  liveOn,
}: {
  links: Partial<Record<SocialPlatform, string | null>>;
  liveOn: SocialPlatform | null;
}) {
  const platforms = SOCIAL_PLATFORMS.filter((platform) => links[platform]);
  if (platforms.length === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-2.5">
      {platforms.map((platform) => {
        const Icon = PLATFORM_ICONS[platform];
        const isLive = liveOn === platform;
        const color = SOCIAL_COLORS[platform];

        return (
          <a
            key={platform}
            href={links[platform] ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={isLive ? `${SOCIAL_LABELS[platform]} — hazırda canlı yayımda` : SOCIAL_LABELS[platform]}
            className={cn(
              "relative flex items-center justify-center rounded-full transition-all",
              isLive
                ? "size-12 shadow-md"
                : "size-9 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            style={isLive ? { color, backgroundColor: `${color}1f` } : undefined}
          >
            <Icon className={isLive ? "size-6" : "size-4.5"} />
            {isLive && (
              <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-background">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}
