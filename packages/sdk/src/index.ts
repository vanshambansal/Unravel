/** Public SDK boundary: custom recorder API plus the complete visitor-controlled widget. */
export { initialize } from './recorder';
export { mountWidget } from './widget';
export type { WidgetOptions, ReportingWidget } from './widget';
export type {
  Recorder,
  RecorderOptions,
  RecorderStatus,
  RecorderState,
  PrivacyOptions,
  RecordingMode,
} from './types';
export type { SubmissionState } from './submission';
export type { Recording } from '@unravel/contracts';
