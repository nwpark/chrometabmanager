export interface InstallationScripts {
  [version: string]: InstallationScript;
}

export type InstallationScript = () => Promise<void>;
