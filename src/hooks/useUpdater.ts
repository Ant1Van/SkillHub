import { useState, useEffect, useCallback } from "react";
import { checkForUpdates, UpdateInfo, CURRENT_VERSION } from "../services/updater";

export function useUpdater() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const check = useCallback(async (openModalIfNoUpdate = false) => {
    try {
      setIsChecking(true);
      setError(null);
      const info = await checkForUpdates();
      setUpdateInfo(info);
      setLastCheckTime(new Date());

      if (info.hasUpdate || openModalIfNoUpdate) {
        setIsModalOpen(true);
      }
    } catch (err: any) {
      console.warn("Update check failed:", err);
      setError(err?.message || "Failed to check for updates");
      if (openModalIfNoUpdate) {
        setIsModalOpen(true);
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // Initial check on launch
    check(false);
  }, [check]);

  return {
    currentVersion: CURRENT_VERSION,
    updateInfo,
    isChecking,
    error,
    isModalOpen,
    setIsModalOpen,
    lastCheckTime,
    checkForUpdatesNow: () => check(true),
  };
}
