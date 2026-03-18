export class MetaMcpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MetaMcpError';
  }
}

export class MetaApiError extends MetaMcpError {
  readonly code: number;
  readonly subcode: number;
  readonly fbtraceId: string;

  constructor(message: string, code: number, subcode: number, fbtraceId: string) {
    super(message);
    this.name = 'MetaApiError';
    this.code = code;
    this.subcode = subcode;
    this.fbtraceId = fbtraceId;
  }

  static fromResponse(response: {
    error: { message: string; code: number; error_subcode?: number; fbtrace_id?: string };
  }): MetaApiError {
    const { message, code, error_subcode, fbtrace_id } = response.error;
    return new MetaApiError(message, code, error_subcode ?? 0, fbtrace_id ?? '');
  }
}

export class AuthenticationError extends MetaMcpError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends MetaMcpError {
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ValidationError extends MetaMcpError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends MetaMcpError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function toMcpError(error: unknown): { isError: true; content: Array<{ type: 'text'; text: string }> } {
  if (error instanceof MetaApiError) {
    return {
      isError: true,
      content: [{ type: 'text', text: `${error.message} (Meta Error: #${error.code})` }],
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true,
    content: [{ type: 'text', text: message }],
  };
}
