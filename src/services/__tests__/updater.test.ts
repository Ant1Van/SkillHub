import { describe, it, expect } from "vitest";
import { isNewerVersion, findMatchingPlatformAsset } from "../updater";

describe("Updater Service", () => {
  describe("isNewerVersion", () => {
    it("detects major version bump", () => {
      expect(isNewerVersion("1.0.0", "0.2.0")).toBe(true);
      expect(isNewerVersion("0.2.0", "1.0.0")).toBe(false);
    });

    it("detects minor version bump", () => {
      expect(isNewerVersion("0.3.0", "0.2.0")).toBe(true);
      expect(isNewerVersion("0.1.0", "0.2.0")).toBe(false);
    });

    it("detects patch version bump", () => {
      expect(isNewerVersion("0.2.1", "0.2.0")).toBe(true);
      expect(isNewerVersion("0.2.0", "0.2.1")).toBe(false);
    });

    it("handles 'v' prefix", () => {
      expect(isNewerVersion("v0.3.0", "0.2.0")).toBe(true);
      expect(isNewerVersion("0.3.0", "v0.2.0")).toBe(true);
    });

    it("returns false for identical versions", () => {
      expect(isNewerVersion("0.2.0", "0.2.0")).toBe(false);
      expect(isNewerVersion("v0.2.0", "0.2.0")).toBe(false);
    });
  });

  describe("findMatchingPlatformAsset", () => {
    const mockAssets = [
      { name: "SkillHub_0.3.0_aarch64.dmg", browser_download_url: "https://example.com/aarch64.dmg" },
      { name: "SkillHub_0.3.0_x64.dmg", browser_download_url: "https://example.com/x64.dmg" },
      { name: "SkillHub_0.3.0_x64-setup.exe", browser_download_url: "https://example.com/setup.exe" },
      { name: "SkillHub_0.3.0_amd64.AppImage", browser_download_url: "https://example.com/appimage" },
    ];

    it("selects platform asset without error", () => {
      const match = findMatchingPlatformAsset(mockAssets);
      expect(match.downloadUrl).toBeTruthy();
      expect(match.assetName).toBeTruthy();
    });

    it("handles empty assets safely", () => {
      const match = findMatchingPlatformAsset([]);
      expect(match.downloadUrl).toBeNull();
      expect(match.assetName).toBeNull();
    });
  });
});
