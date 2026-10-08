export const isMac =
  typeof navigator !== "undefined" &&
  (/Mac|iPod|iPhone|iPad/.test(navigator.platform || "") ||
    /Mac/.test(navigator.userAgent || ""));

export const isWindows =
  typeof navigator !== "undefined" &&
  (/Win/.test(navigator.platform || "") ||
    /Windows/.test(navigator.userAgent || ""));

export const getSearchShortcutLabel = (): string => (isMac ? "⌘K" : "Ctrl+K");

export const getFileManagerName = (): string =>
  isMac ? "Finder" : isWindows ? "Explorer" : "File Manager";
