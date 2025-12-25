/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PACKAGE_VERSION: string;
  // Add other env variables here if you switch from process.env to import.meta.env
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}