/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** Same OAuth Web client ID as backend `GOOGLE_CLIENT_ID` (public; not the secret). */
  readonly GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
