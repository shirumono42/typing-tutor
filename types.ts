export enum AppMode {
  HOME = 'HOME',
  MENU = 'MENU',
  TYPING = 'TYPING',
  CREATE = 'CREATE',
}

export enum LessonType {
  FILTER = 'FILTER',
  SYNTH = 'SYNTH',
}

export enum FileType {
  PROCESSOR_H = 'PluginProcessor.h',
  PROCESSOR_CPP = 'PluginProcessor.cpp',
  EDITOR_H = 'PluginEditor.h',
  EDITOR_CPP = 'PluginEditor.cpp',
}

export type LessonId = LessonType | string;

export type LessonFileKey = FileType | string;

export type SegmentType = 'auto' | 'type';

export type ProgrammingLanguage = 'c_cpp' | 'python' | 'java' | 'csharp' | 'javascript' | 'typescript';

export interface CodeSegment {
  text: string;
  type: SegmentType;
}

export interface LessonData {
  id: LessonId;
  title: string;
  description: string;
  files: Record<LessonFileKey, CodeSegment[]>;
  fileOrder: LessonFileKey[];
  fileLanguages: Record<LessonFileKey, ProgrammingLanguage>;
  tags: string[];
  isCustom?: boolean;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  progress: number;
  mistakes: number;
  startTime: number | null;
  endTime: number | null;
}

export enum Language {
  EN = 'EN',
  JP = 'JP',
}
