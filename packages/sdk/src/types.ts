import type { Recording, StopReason } from '@unravel/contracts';
import type { SubmissionState } from './submission';
export type PrivacyOptions = {
  allowTextSelectors?: string[];
  allowValueSelectors?: string[];
  testIds?: string[];
  paths?: string[];
  stylesheetPaths?: string[];
  errorMessages?: string[];
};
export type RecorderState = 'idle' | 'starting' | 'recording' | 'stopped' | 'destroyed';
export type RecorderStatus = { state: RecorderState; reason: StopReason | null; eventCount: number; bytes: number; durationMs: number; filteredReplayEvents: number };
export type RecorderOptions = {
  projectId: string;
  privacy?: PrivacyOptions;
  limits?: { maxDurationMs?: number; maxBytes?: number; maxEvents?: number };
  onStateChange?: (status: RecorderStatus) => void;
  submissionUrl?: string;
  onSubmissionChange?: (status: SubmissionState) => void;
};
export interface Recorder {
  start(): Promise<void>;
  stop(): Recording | null;
  getRecording(): Recording | null;
  getStatus(): RecorderStatus;
  destroy(): void;
  submit(details: { title: string; description?: string }): Promise<import('@unravel/contracts').SubmissionReceipt>;
  getSubmissionStatus(): SubmissionState;
}
