import { icons } from "@/constants/icons";

// Mapping of subscription names to existing icons
const ICON_MAPPING: Record<string, keyof typeof icons> = {
  adobe: "adobe",
  "adobe creative cloud": "adobe",
  github: "github",
  "github pro": "github",
  claude: "claude",
  "claude pro": "claude",
  canva: "canva",
  "canva pro": "canva",
  spotify: "spotify",
  notion: "notion",
  figma: "figma",
  dropbox: "dropbox",
  openai: "openai",
  chatgpt: "openai",
  medium: "medium",
};

// Icon cache for API-fetched logos
const iconCache = new Map<string, string>();

// Normalize name for matching
const normalizeName = (name: string): string => {
  return name.toLowerCase().trim();
};

// Check if subscription name matches a known icon
const getLocalIcon = (name: string): keyof typeof icons | null => {
  const normalized = normalizeName(name);

  // Exact match
  if (ICON_MAPPING[normalized]) {
    return ICON_MAPPING[normalized];
  }

  // Partial match - check if any key is contained in the name
  for (const [key, iconKey] of Object.entries(ICON_MAPPING)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return iconKey;
    }
  }

  return null;
};

// Fetch logo from Clearbit API
const fetchClearbitLogo = async (name: string): Promise<string | null> => {
  try {
    const cacheKey = normalizeName(name);

    // Check cache first
    if (iconCache.has(cacheKey)) {
      return iconCache.get(cacheKey) || null;
    }

    // Domain name inference - convert "Adobe Creative Cloud" to "adobe.com"
    const domainName = normalizeName(name)
      .split(/\s+/)[0] // Get first word
      .replace(/[^a-z0-9]/g, ""); // Remove special chars

    const domain = `${domainName}.com`;
    const logoUrl = `https://logo.clearbit.com/${domain}`;

    // Don't actually fetch - just return the URL for React Native to load
    // Clearbit serves logos at predictable URLs
    iconCache.set(cacheKey, logoUrl);
    return logoUrl;
  } catch (error) {
    return null;
  }
};

export const getIconForSubscription = async (
  name: string,
): Promise<{ type: "local" | "remote"; source: any }> => {
  // First, try to find a local icon
  const localIcon = getLocalIcon(name);
  if (localIcon) {
    return {
      type: "local",
      source: icons[localIcon],
    };
  }

  // Then try to fetch from Clearbit
  const remoteUrl = await fetchClearbitLogo(name);
  if (remoteUrl) {
    return {
      type: "remote",
      source: { uri: remoteUrl },
    };
  }

  // Fallback to wallet icon
  return {
    type: "local",
    source: icons.wallet,
  };
};
