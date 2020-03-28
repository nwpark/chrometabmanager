export interface VersionHistory {
  [version: string]: VersionInformation;
}

export interface VersionInformation {
  releaseDate: Date;
  changes: {
    title: string;
    description?: string;
  }[];
}
