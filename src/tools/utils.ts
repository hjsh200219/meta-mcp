import type { Logger } from '../lib/logger.js';
import { toMcpError } from '../lib/errors.js';

type McpContent = { type: 'text'; text: string };
type McpResult = { content: McpContent[]; isError?: boolean };
type ToolHandler<T> = (params: T) => Promise<McpResult>;

export function withErrorHandling<T>(
  toolName: string,
  logger: Logger,
  handler: ToolHandler<T>,
): ToolHandler<T> {
  return async (params: T) => {
    try {
      return await handler(params);
    } catch (error) {
      logger.warn({ error, tool: toolName }, 'Tool execution failed');
      return toMcpError(error);
    }
  };
}
