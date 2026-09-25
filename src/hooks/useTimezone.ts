import { useEffect, useState } from "react";
import { TIMEZONE_STORAGE_KEY } from "../constants/misc";
import { getBrowserTimezone } from "../lib/timezone";

/** The person's chosen display/input timezone, persisted like the theme preference. */
export function useTimezone() {
  const [timezone, setTimezone] = useState<string>(() => {
    return localStorage.getItem(TIMEZONE_STORAGE_KEY) || getBrowserTimezone();
  });

  useEffect(() => {
    localStorage.setItem(TIMEZONE_STORAGE_KEY, timezone);
  }, [timezone]);

  return { timezone, setTimezone };
}
