export class ApplicationError extends Error {
  readonly status: number;
  readonly fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApplicationError';
    this.status = status;
    this.fields = fields;
  }
}
