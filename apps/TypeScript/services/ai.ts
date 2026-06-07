/**
 * Thunders-GenerativeAI Desktop Studio — AI Service
 *
 * Provides AI-powered capabilities including:
 * - Code completion (inline suggestions)
 * - Chat-based assistance (multi-turn conversations)
 * - Code generation from natural language
 * - Refactoring suggestions
 * - Bug detection and fix proposals
 * - Test generation
 *
 * Communicates with AI backends via REST API or local inference.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature (0.0 - 1.0) */
  temperature?: number;
  /** Stop sequences */
  stop?: string[];
  /** Top-p sampling */
  topP?: number;
  /** Frequency penalty */
  frequencyPenalty?: number;
  /** Presence penalty */
  presencePenalty?: number;
}

export interface AICompletionResult {
  text: string;
  finishReason: "stop" | "length" | "content_filter" | null;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIChatSession {
  id: string;
  messages: AIMessage[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface RefactorSuggestion {
  title: string;
  description: string;
  originalCode: string;
  suggestedCode: string;
  confidence: number;
  category: "performance" | "readability" | "safety" | "best-practice";
}

export interface BugReport {
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location: { line: number; column: number };
  suggestedFix: string;
  confidence: number;
}

export interface TestCase {
  name: string;
  code: string;
  description: string;
}

// ─── Configuration ────────────────────────────────────────────────────────────

interface AIConfig {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  defaultMaxTokens: number;
  defaultTemperature: number;
  defaultTopP: number;
  requestTimeout: number;
}

const DEFAULT_CONFIG: AIConfig = {
  apiEndpoint: "https://api.thunders-ai.dev/v1",
  apiKey: "",
  model: "thunders-code-v2",
  defaultMaxTokens: 2048,
  defaultTemperature: 0.2,
  defaultTopP: 0.95,
  requestTimeout: 30000,
};

// ─── System Prompts ───────────────────────────────────────────────────────────

const CODE_COMPLETION_SYSTEM_PROMPT = `You are an expert coding assistant integrated into Thunders Desktop Studio.
Provide concise, correct code completions. Follow the user's coding style and conventions.
Only output code — no explanations unless explicitly asked.`;

const CHAT_SYSTEM_PROMPT = `You are Thunders AI, an expert coding assistant integrated into Thunders Desktop Studio IDE.
You help developers write, debug, refactor, and understand code.
When suggesting code, use markdown code blocks with the appropriate language tag.
Be concise but thorough. When you're unsure, say so rather than guessing.`;

const REFACTOR_SYSTEM_PROMPT = `You are a code refactoring expert. Analyze the provided code and suggest improvements.
Focus on: performance, readability, safety, and best practices.
For each suggestion, provide the original code, the improved code, and a brief explanation.`;

const BUG_DETECTION_SYSTEM_PROMPT = `You are a bug detection expert. Analyze the provided code and identify potential bugs.
For each bug, specify: severity, description, location, and a suggested fix.
Focus on: null/undefined errors, off-by-one errors, race conditions, resource leaks, and logic errors.`;

const TEST_GENERATION_SYSTEM_PROMPT = `You are a test generation expert. Generate comprehensive unit tests for the provided code.
Cover: happy paths, edge cases, error cases, and boundary conditions.
Use the testing framework appropriate for the language (jest for JS/TS, pytest for Python, etc.).`;

// ─── AI Service Class ─────────────────────────────────────────────────────────

export class AIService {
  private config: AIConfig;
  private chatSessions: Map<string, AIChatSession> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config?: Partial<AIConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadConfig();
  }

  // ── Configuration Management ───────────────────────────────────────────

  private loadConfig(): void {
    // In production, load from secure storage (keychain / credential manager)
    try {
      const stored = localStorage.getItem("thunders-ai-config");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...this.config, ...parsed };
      }
    } catch {
      // Use defaults
    }
  }

  updateConfig(updates: Partial<AIConfig>): void {
    this.config = { ...this.config, ...updates };
    try {
      localStorage.setItem("thunders-ai-config", JSON.stringify(this.config));
    } catch {
      // Storage unavailable
    }
  }

  getConfig(): Readonly<AIConfig> {
    return { ...this.config };
  }

  // ── Core API Call ──────────────────────────────────────────────────────

  private async callAPI(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResult> {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);

    const mergedOptions: AICompletionOptions = {
      maxTokens: options?.maxTokens ?? this.config.defaultMaxTokens,
      temperature: options?.temperature ?? this.config.defaultTemperature,
      topP: options?.topP ?? this.config.defaultTopP,
      frequencyPenalty: options?.frequencyPenalty ?? 0,
      presencePenalty: options?.presencePenalty ?? 0,
      stop: options?.stop,
    };

    try {
      const response = await fetch(`${this.config.apiEndpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          ...mergedOptions,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        text: data.choices?.[0]?.message?.content ?? "",
        finishReason: data.choices?.[0]?.finish_reason ?? null,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return { text: "", finishReason: null };
      }
      throw error;
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  // ── Cancel ongoing request ─────────────────────────────────────────────

  cancelRequest(requestId?: string): void {
    if (requestId) {
      this.abortControllers.get(requestId)?.abort();
      this.abortControllers.delete(requestId);
    } else {
      // Cancel all requests
      this.abortControllers.forEach((controller) => controller.abort());
      this.abortControllers.clear();
    }
  }

  // ── Code Completion ────────────────────────────────────────────────────

  async completeCode(
    code: string,
    cursorLine: number,
    language: string,
    options?: AICompletionOptions
  ): Promise<string | null> {
    // Extract context around the cursor
    const lines = code.split("\n");
    const contextStart = Math.max(0, cursorLine - 50);
    const contextEnd = Math.min(lines.length, cursorLine + 10);
    const beforeCursor = lines.slice(contextStart, cursorLine).join("\n");
    const afterCursor = lines.slice(cursorLine, contextEnd).join("\n");

    const messages: AIMessage[] = [
      { role: "system", content: CODE_COMPLETION_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Language: ${language}\n\nCode before cursor:\n\`\`\`${language}\n${beforeCursor}\n\`\`\`\n\nCode after cursor:\n\`\`\`${language}\n${afterCursor}\n\`\`\`\n\nComplete the code at the cursor position. Output only the completion.`,
      },
    ];

    const result = await this.callAPI(messages, {
      ...options,
      maxTokens: options?.maxTokens ?? 256,
      temperature: options?.temperature ?? 0.1,
      stop: ["\n\n", "```"],
    });

    return result.text.trim() || null;
  }

  // ── Chat ───────────────────────────────────────────────────────────────

  async chat(
    userMessage: string,
    conversationHistory: AIMessage[] = [],
    options?: AICompletionOptions
  ): Promise<string> {
    const messages: AIMessage[] = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    const result = await this.callAPI(messages, options);
    return result.text;
  }

  // ── Code Generation ────────────────────────────────────────────────────

  async generateCode(
    prompt: string,
    language: string,
    options?: AICompletionOptions
  ): Promise<string> {
    const messages: AIMessage[] = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate ${language} code for the following:\n\n${prompt}\n\nOutput the code in a markdown code block.`,
      },
    ];

    const result = await this.callAPI(messages, {
      ...options,
      maxTokens: options?.maxTokens ?? 1024,
      temperature: options?.temperature ?? 0.3,
    });

    // Extract code from markdown block if present
    const codeBlockMatch = result.text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    return codeBlockMatch ? codeBlockMatch[1].trim() : result.text.trim();
  }

  // ── Refactoring ────────────────────────────────────────────────────────

  async suggestRefactors(
    code: string,
    language: string,
    options?: AICompletionOptions
  ): Promise<RefactorSuggestion[]> {
    const messages: AIMessage[] = [
      { role: "system", content: REFACTOR_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze this ${language} code for refactoring opportunities:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nRespond with a JSON array of suggestions. Each suggestion should have: title, description, originalCode, suggestedCode, confidence (0-1), and category (performance|readability|safety|best-practice).`,
      },
    ];

    const result = await this.callAPI(messages, {
      ...options,
      temperature: 0.2,
    });

    try {
      // Try to parse JSON from the response
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback: return a single suggestion from the raw text
    }

    return [
      {
        title: "AI Refactoring Suggestion",
        description: result.text,
        originalCode: code,
        suggestedCode: result.text,
        confidence: 0.5,
        category: "best-practice",
      },
    ];
  }

  // ── Bug Detection ──────────────────────────────────────────────────────

  async detectBugs(
    code: string,
    language: string,
    options?: AICompletionOptions
  ): Promise<BugReport[]> {
    const messages: AIMessage[] = [
      { role: "system", content: BUG_DETECTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze this ${language} code for bugs:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nRespond with a JSON array of bugs. Each bug should have: severity (low|medium|high|critical), description, location ({line, column}), suggestedFix, and confidence (0-1).`,
      },
    ];

    const result = await this.callAPI(messages, {
      ...options,
      temperature: 0.1,
    });

    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Parse error
    }

    return [];
  }

  // ── Test Generation ────────────────────────────────────────────────────

  async generateTests(
    code: string,
    language: string,
    framework?: string,
    options?: AICompletionOptions
  ): Promise<TestCase[]> {
    const fw = framework ?? this.inferTestFramework(language);
    const messages: AIMessage[] = [
      { role: "system", content: TEST_GENERATION_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate ${fw} tests for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nRespond with a JSON array of test cases. Each should have: name, code, and description.`,
      },
    ];

    const result = await this.callAPI(messages, {
      ...options,
      maxTokens: options?.maxTokens ?? 2048,
      temperature: 0.3,
    });

    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Parse error
    }

    return [
      {
        name: "Generated Test Suite",
        code: result.text,
        description: "AI-generated test suite",
      },
    ];
  }

  // ── Chat Session Management ────────────────────────────────────────────

  createChatSession(): AIChatSession {
    const session: AIChatSession = {
      id: `chat-${Date.now()}`,
      messages: [{ role: "system", content: CHAT_SYSTEM_PROMPT }],
      model: this.config.model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.chatSessions.set(session.id, session);
    return session;
  }

  getChatSession(id: string): AIChatSession | undefined {
    return this.chatSessions.get(id);
  }

  deleteChatSession(id: string): void {
    this.chatSessions.delete(id);
  }

  listChatSessions(): AIChatSession[] {
    return Array.from(this.chatSessions.values()).sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
  }

  // ── Utility ────────────────────────────────────────────────────────────

  private inferTestFramework(language: string): string {
    const frameworks: Record<string, string> = {
      typescript: "Jest",
      javascript: "Jest",
      python: "pytest",
      rust: "cargo test",
      go: "testing",
      java: "JUnit",
      csharp: "xUnit",
    };
    return frameworks[language] ?? "generic";
  }

  /**
   * Estimate token count for a string (rough approximation).
   * Real implementation should use the tokenizer matching the model.
   */
  estimateTokens(text: string): number {
    // Rough: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if the AI service is available (API is reachable).
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

let _instance: AIService | null = null;

export function getAIService(config?: Partial<AIConfig>): AIService {
  if (!_instance) {
    _instance = new AIService(config);
  }
  return _instance;
}

export function resetAIService(): void {
  _instance = null;
}
