/// <reference types="vite/client" />

declare module "*.html?raw" {
  const content: string;
  export default content;
}

declare module "*.css";

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
  // Add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
