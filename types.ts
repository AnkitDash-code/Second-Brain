export enum MemoryType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface ActionItem {
  type: 'task' | 'event' | 'none';
  description: string;
  date?: string;
  completed: boolean;
}

export interface Memory {
  id: string;
  type: MemoryType;
  content: string; // The text content or transcription
  blob?: Blob; // The raw file for images/audio
  summary?: string; // AI generated summary
  timestamp: number;
  tags: string[];
  verified?: boolean; // For caregiver validation
  sentiment?: Sentiment;
  entities?: string[];
  action?: ActionItem;
  confidenceScore?: number; // 0.0 to 1.0
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ProcessingStatus = 'idle' | 'recording' | 'processing' | 'saving' | 'error' | 'success';

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
}