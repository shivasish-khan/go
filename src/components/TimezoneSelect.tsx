import { useMemo } from "react";
import { Globe } from "lucide-react";
import { formatUtcOffset, getTimeZoneOffsetMinutes, listTimezones } from "../lib/timezone";

type TimezoneSelectProps = {
  timezone: string;
  onChange: (value: string) => void;
  className?: string;
};

/** Lets the person pick the timezone every date/time in the app is shown and entered in. */
export function TimezoneSelect({ timezone, onChange, className }: TimezoneSelectProps) {
  const options = useMemo(() => {
    const now = new Date();
    const zones = listTimezones();
    const withCurrent = zones.includes(timezone) ? zones : [...zones, timezone];

    return withCurrent
      .map((zone) => ({ zone, offset: getTimeZoneOffsetMinutes(zone, now) }))
      .sort((a, b) => a.offset - b.offset || a.zone.localeCompare(b.zone));
  }, [timezone]);

  return (
    <label className={className ? `timezoneSelect ${className}` : "timezoneSelect"} title="Times are shown in this timezone">
      <Globe size={14} strokeWidth={2.25} />
      <select value={timezone} onChange={(event) => onChange(event.target.value)} aria-label="Display timezone">
        {options.map(({ zone, offset }) => (
          <option value={zone} key={zone}>
            {`UTC${formatUtcOffset(offset)} \u00B7 ${zone.replace(/_/g, " ")}`}
          </option>
        ))}
      </select>
    </label>
  );
}
