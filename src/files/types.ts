// Types and Interfaces
export interface ProcessingResult {
  inputFile: string;
  outputFiles: string[];
  success: boolean;
  error?: string;
}

export interface ImageMetadata {
  dateCreated: string;
  width?: number;
  height?: number;
}
