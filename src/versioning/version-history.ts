export interface VersionHistory {
  [version: string]: ReleaseNotes;
}

export interface ReleaseNotes {
  releaseDate: Date;
  changes: {
    title: string;
    description?: string;
  }[];
}
