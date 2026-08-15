import type { IconType } from "react-icons";
import { GiCube, GiOrbital } from "react-icons/gi";
import {
  IoBusinessOutline,
  IoCameraOutline,
  IoEarthOutline,
  IoEyeOutline,
  IoFlagOutline,
  IoGlobeOutline,
  IoImageOutline,
  IoLeafOutline,
  IoNavigateOutline,
  IoPlanetOutline,
  IoPulseOutline,
  IoRadioOutline,
  IoRocketOutline,
  IoSunnyOutline,
  IoTimeOutline,
  IoWarningOutline,
} from "react-icons/io5";

const BY_ID: Record<string, IconType> = {
  "space-in-plain-sight": IoEyeOutline,
  "space-as-infrastructure": IoBusinessOutline,
  "who-pays-for-space": IoGlobeOutline,
  "thai-space-story": IoFlagOutline,
  "orbit-sense": GiOrbital,
  "low-earth": IoEarthOutline,
  "high-and-parked": IoNavigateOutline,
  "who-sees-whom": IoPulseOutline,
  "many-in-formation": IoPlanetOutline,
  "harsh-space": IoWarningOutline,
  "heat-and-shadow": IoSunnyOutline,
  "radiation-hit": IoWarningOutline,
  "crowded-sky": IoPlanetOutline,
  "cubesat-for-beginner": GiCube,
  "why-ten-centimeters": GiCube,
  "cubesat-parade": IoRocketOutline,
  "the-point-of-flying": IoCameraOutline,
  "the-ground-station": IoRadioOutline,
  "catch-the-pass": IoTimeOutline,
  "ground-and-ops": IoRadioOutline,
  "housekeeping": IoPulseOutline,
  "command-from-home": IoRadioOutline,
  "earth-from-orbit": IoImageOutline,
  "color-beyond-eyes": IoImageOutline,
  "change-over-time": IoImageOutline,
  "space-for-thailand": IoLeafOutline,
  "rice-from-orbit": IoLeafOutline,
};

const BY_TAG: Record<string, IconType> = {
  cubesat: GiCube,
  orbits: GiOrbital,
  leo: IoEarthOutline,
  ground: IoRadioOutline,
  ops: IoRadioOutline,
  eo: IoImageOutline,
  thailand: IoLeafOutline,
  environment: IoSunnyOutline,
  thermal: IoSunnyOutline,
  radiation: IoWarningOutline,
  payload: IoCameraOutline,
  everyday: IoEyeOutline,
  infrastructure: IoBusinessOutline,
  foundations: IoPlanetOutline,
};

export function iconForCourse(courseId: string, tags: string[] = []): IconType {
  const fromId = BY_ID[courseId];
  if (fromId) return fromId;
  for (const tag of tags) {
    const fromTag = BY_TAG[tag];
    if (fromTag) return fromTag;
  }
  return IoPlanetOutline;
}

const PLACEMENT: Record<"br" | "none", { pos: string; mask?: string }> = {
  br: {
    pos: "absolute bottom-1.5 right-1.5",
    mask: "linear-gradient(to right, transparent 0%, black 78%)",
  },
  none: {
    pos: "absolute top-1.5 right-1.5",
  },
};

export function CourseWatermark({
  courseId,
  tags = [],
  size = "md",
  fade = "br",
}: {
  courseId: string;
  tags?: string[];
  size?: "sm" | "md";
  fade?: "br" | "none";
}) {
  const Icon = iconForCourse(courseId, tags);
  const iconSize = size === "sm" ? "h-10 w-10" : "h-[5rem] w-[5rem]";
  const { pos, mask } = PLACEMENT[fade];
  return (
    <span
      aria-hidden
      className={`pointer-events-none ${pos} ${fade === "none" ? "text-cyan/25" : "text-cyan/40"}`}
      style={
        mask
          ? {
              maskImage: mask,
              WebkitMaskImage: mask,
            }
          : undefined
      }
    >
      <Icon className={iconSize} />
    </span>
  );
}
