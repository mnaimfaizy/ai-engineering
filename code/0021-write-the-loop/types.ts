// The wire shapes of the Claude Messages API, cut down to what a tool loop touches.
// Same field names as the real thing, so the loop you write here ports unchanged.

export type TextBlock = { type: "text"; text: string };

export type ToolUseBlock = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
};

export type ToolResultBlock = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
};

export type ContentBlock = TextBlock | ToolUseBlock;

export type Message =
  | { role: "user"; content: string | ToolResultBlock[] }
  | { role: "assistant"; content: ContentBlock[] };

export type ToolDefinition = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

export type CreateParams = {
  model: string;
  max_tokens: number;
  tools: ToolDefinition[];
  messages: Message[];
};

export type ModelResponse = {
  role: "assistant";
  content: ContentBlock[];
  stop_reason: "end_turn" | "tool_use";
  usage: { input_tokens: number; output_tokens: number };
};

// With the real SDK this is `client.messages`.
export type Model = {
  create(params: CreateParams): Promise<ModelResponse>;
};

export type RunResult = {
  answer: string;
  messages: Message[];
  stopped: "end_turn" | "max_turns";
};
