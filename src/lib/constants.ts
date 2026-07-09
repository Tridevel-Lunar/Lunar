/** Browser → API prefix (Vite dev proxy strips /api → backend) */
export const API_URL = import.meta.env.VITE_API_URL ?? "/api";

/** Default profile image when user has no custom avatar */
export const DEFAULT_AVATAR_URL = "/space-avatar-default.png";

/** LAIKA mentor avatar (Studio) */
export const LAIKA_AVATAR_URL = "/LAIKA.png";
