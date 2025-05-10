declare module '@mistralai/mistralai' {
  export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }

  export interface ChatCompletionOptions {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
  }

  export interface ChatCompletionResponse {
    choices: Array<{
      message: {
        role: string;
        content: string;
      };
    }>;
  }

  export class Mistral {
    constructor(options: { apiKey: string });
    chat: {
      complete(options: ChatCompletionOptions): Promise<ChatCompletionResponse>;
    };
  }

  export class MistralClient {
    constructor(apiKey: string);
    chat(params: {
      model: string;
      messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
      }>;
    }): Promise<any>;
  }
} 