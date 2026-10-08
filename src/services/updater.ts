import { isMac, isWindows } from "../utils/platform";

export const CURRENT_VERSION = "0.2.1";

export interface UpdateAsset {
  name: string;
  size: number;
  downloadUrl: string;
}

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseName: string;
  releaseNotes: string;
  releaseUrl: string;
  publishedAt: string;
  downloadUrl: string | null;
  assetName: string | null;
}

function parseSemver(v: string): [number, number, number] {
  const clean = v.replace(/^v/, "").trim();
  const parts = clean.split(".").map((n) => parseInt(n, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

export function isNewerVersion(latest: string, current: string): boolean {
  const [lMajor, lMinor, lPatch] = parseSemver(latest);
  const [cMajor, cMinor, cPatch] = parseSemver(current);

  if (lMajor > cMajor) return true;
  if (lMajor < cMajor) return false;

  if (lMinor > cMinor) return true;
  if (lMinor < cMinor) return false;

  return lPatch > cPatch;
}

export function findMatchingPlatformAsset(assets: Array<{ name: string; browser_download_url: string }>): {
  downloadUrl: string | null;
  assetName: string | null;
} {
  if (!assets || assets.length === 0) {
    return { downloadUrl: null, assetName: null };
  }

  const isArm = typeof navigator !== "undefined" && (/arm|aarch64/i.test(navigator.userAgent || ""));

  let targetAsset = null;

  if (isMac) {
    if (isArm) {
      targetAsset = assets.find((a) => a.name.includes("aarch64.dmg")) || assets.find((a) => a.name.endsWith(".dmg"));
    } else {
      targetAsset = assets.find((a) => a.name.includes("x64.dmg")) || assets.find((a) => a.name.endsWith(".dmg"));
    }
  } else if (isWindows) {
    targetAsset = assets.find((a) => a.name.endsWith("-setup.exe")) || assets.find((a) => a.name.endsWith(".exe"));
  } else {
    // Linux
    targetAsset = assets.find((a) => a.name.endsWith(".AppImage")) || assets.find((a) => a.name.endsWith(".deb"));
  }

  if (targetAsset) {
    return { downloadUrl: targetAsset.browser_download_url, assetName: targetAsset.name };
  }

  // Fallback to first available asset
  return { downloadUrl: assets[0].browser_download_url, assetName: assets[0].name };
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  const response = await fetch("https://api.github.com/repos/Ant1Van/SkillHub/releases/latest", {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to check updates (HTTP ${response.status})`);
  }

  const data = await response.json();
  const rawTag: string = data.tag_name || "";
  const latestVersion = rawTag.replace(/^v/, "");
  const hasUpdate = isNewerVersion(latestVersion, CURRENT_VERSION);

  const { downloadUrl, assetName } = findMatchingPlatformAsset(data.assets || []);

  return {
    currentVersion: CURRENT_VERSION,
    latestVersion,
    hasUpdate,
    releaseName: data.name || rawTag,
    releaseNotes: data.body || "No release notes provided.",
    releaseUrl: data.html_url || "https://github.com/Ant1Van/SkillHub/releases",
    publishedAt: data.published_at || "",
    downloadUrl,
    assetName,
  };
}
