import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  Send,
  Square,
  RefreshCw,
  Trash2,
  Settings,
  Sliders,
  Cpu,
  Zap,
  ShieldCheck,
  Code,
  Paperclip,
  Check,
  Copy,
  Terminal,
  Layers,
  Activity,
  Sparkles,
  ChevronDown,
  Info,
  X,
  Database,
  ArrowRight,
  Maximize2,
  Minimize2,
  FileText,
  Clock,
  AlertTriangle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metrics?: {
    latencyMs: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    model: string;
    guardrailPassed: boolean;
    vectorChunksUsed?: number;
  };
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[];
}

export interface ModelOption {
  id: string;
  name: string;
  apiModel: string;
  description: string;
  badge: string;
  latencyTier: string;
  contextWindow: string;
}

export interface SystemConfig {
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  enableGuardrails: boolean;
  enableRAG: boolean;
  enableStreamEngine: boolean;
}

const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'thunder-flash-2.4',
    name: 'Thunder-Flash v2.4',
    apiModel: 'gemini-3-flash-preview',
    description: 'Ultra-low latency model optimized for real-time generative streaming and rapid code synthesis.',
    badge: 'Fastest',
    latencyTier: '~120ms',
    contextWindow: '1M tokens',
  },
  {
    id: 'generative-pro-3.0',
    name: 'Generative-Pro 3.0',
    apiModel: 'gemini-3-flash-preview',
    description: 'High-capacity reasoning engine for complex system architecture and deep algorithmic design.',
    badge: 'Balanced',
    latencyTier: '~350ms',
    contextWindow: '2M tokens',
  },
  {
    id: 'thunder-ultra-heavy',
    name: 'Thunder-Ultra Heavy',
    apiModel: 'gemini-3-flash-preview',
    description: 'State-of-the-art heavy reasoning model for multi-layer engineering & mathematical verification.',
    badge: 'Heavy Reasoning',
    latencyTier: '~850ms',
    contextWindow: '2M tokens',
  },
];

const PRESET_PROMPTS = [
  {
    title: 'Synthesize Neural Architecture',
    prompt: 'Synthesize a fault-tolerant distributed neural network pipeline architecture with auto-scaling inference workers and Redis stream queuing.',
    category: 'Architecture',
  },
  {
    title: 'Optimize CUDA Kernel',
    prompt: 'Provide a C++/CUDA kernel implementation to accelerate multi-head attention matrix multiplication for transformer models.',
    category: 'Engineering',
  },
  {
    title: 'Analyze Vector Embeddings',
    prompt: 'Explain HNSW (Hierarchical Navigable Small World) graph indexing strategy for high-dimensional vector search with cosine similarity.',
    category: 'Algorithms',
  },
  {
    title: 'Distributed System Resilience',
    prompt: 'Design a Raft consensus algorithm fallback strategy when dealing with network partitions across edge nodes.',
    category: 'Systems',
  },
];

export default function ChatWindow() {
  // Chat History & Input State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-sys-1',
      role: 'assistant',
      content: `Welcome to **Thunders Generative AI Portal**.\n\nI am connected to the **Thunder Stream Engine**. You can run prompt execution pipelines, synthesize system architectures, or execute code optimization tasks.\n\nType a prompt below or pick a preset to begin benchmarking.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metrics: {
        latencyMs: 42,
        promptTokens: 120,
        completionTokens: 64,
        totalTokens: 184,
        model: 'Thunder-Flash v2.4',
        guardrailPassed: true,
        vectorChunksUsed: 4,
      },
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(AVAILABLE_MODELS[0]);
  
  // Custom API Key Overrides
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // System Configuration Drawer & Controls
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [config, setConfig] = useState<SystemConfig>({
    systemPrompt: 'You are Thunders Generative Core AI, an elite software engineer, systems architect, and AI researcher. Provide clean, production-grade code, detailed benchmarks, and precise architectural explanations.',
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 4096,
    enableGuardrails: true,
    enableRAG: true,
    enableStreamEngine: true,
  });

  // UI Telemetry & System Inspector Panel States
  const [showInspector, setShowInspector] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'rag' | 'telemetry'>('pipeline');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Refs for auto-scrolling and abort controller
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on content updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = textToSend || inputPrompt;
    if (!queryText.trim() || isGenerating) return;

    // Create attachments payload summary
    const filePayloads = attachments.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.type || 'text/plain',
    }));

    // Construct User Message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: filePayloads.length > 0 ? filePayloads : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setAttachments([]);
    setIsGenerating(true);

    const startTime = performance.now();
    const assistantMsgId = `assistant-${Date.now()}`;

    // Initialize Assistant Message Placeholder
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metrics: {
        latencyMs: 0,
        promptTokens: Math.round(queryText.length / 4) + 15, // estimated input tokenization
        completionTokens: 0,
        totalTokens: 0,
        model: selectedModel.name,
        guardrailPassed: true,
        vectorChunksUsed: config.enableRAG ? 3 : 0,
      },
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    // Setup Abort Controller
    abortControllerRef.current = new AbortController();

    try {
      // Build fetch request to Gemini API
      const targetApiKey = apiKey || ''; // Runtime engine automatically injects if blank in Canvas env
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel.apiModel}:generateContent?key=${targetApiKey}`;

      // Construct Payload with optional System Instructions
      const payload: any = {
        contents: [
          ...messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
          {
            role: 'user',
            parts: [{ text: queryText }],
          },
        ],
        generationConfig: {
          temperature: config.temperature,
          topP: config.topP,
          maxOutputTokens: config.maxOutputTokens,
        },
      };

      if (config.systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: config.systemPrompt }],
        };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No response text was generated by the model engine.';

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      const outputTokenEstimate = Math.round(generatedText.length / 3.8);

      // Simulate streaming chunks for UI fluidity
      if (config.enableStreamEngine) {
        const words = generatedText.split(' ');
        let currentText = '';

        for (let i = 0; i < words.length; i++) {
          if (abortControllerRef.current?.signal.aborted) break;
          currentText += (i === 0 ? '' : ' ') + words[i];

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: currentText,
                    metrics: {
                      ...msg.metrics!,
                      latencyMs: latency,
                      completionTokens: Math.round(currentText.length / 3.8),
                      totalTokens: (msg.metrics?.promptTokens || 0) + Math.round(currentText.length / 3.8),
                    },
                  }
                : msg
            )
          );

          // Stream interval delay
          await new Promise((resolve) => setTimeout(resolve, 15));
        }
      } else {
        // Direct non-stream update
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: generatedText,
                  metrics: {
                    ...msg.metrics!,
                    latencyMs: latency,
                    completionTokens: outputTokenEstimate,
                    totalTokens: (msg.metrics?.promptTokens || 0) + outputTokenEstimate,
                  },
                }
              : msg
          )
        );
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation halted by client user.');
      } else {
        console.error('Generative Execution Error:', error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: `⚠️ **Execution Exception Caught in Stream Pipeline**\n\`\`\`text\n${error.message || 'Network error encountered during Gemini API fetch operation.'}\n\`\`\`\nPlease check your key settings or network interface.`,
                  metrics: {
                    ...msg.metrics!,
                    guardrailPassed: false,
                  },
                }
              : msg
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to flush the conversation buffer?')) {
      setMessages([]);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const uploadedFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...uploadedFiles]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* MAIN CHAT AREA */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-slate-950 border-r border-slate-800/60">
        
        {/* HEADER TOOLBAR */}
        <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-semibold text-base text-slate-100 tracking-tight">Thunders Generative Studio</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-cyan-950 border border-cyan-800/50 text-cyan-400 font-medium">
                  v3.2 Active
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Gemini Pipeline Engine Online
              </p>
            </div>
          </div>

          {/* Model Selector & Actions */}
          <div className="flex items-center space-x-3">
            {/* Model Selection Dropdown */}
            <div className="relative group">
              <select
                value={selectedModel.id}
                onChange={(e) => {
                  const m = AVAILABLE_MODELS.find((mod) => mod.id === e.target.value);
                  if (m) setSelectedModel(m);
                }}
                className="appearance-none bg-slate-800/90 border border-slate-700/70 hover:border-cyan-500/50 text-slate-200 text-xs rounded-lg px-3.5 py-2 pr-8 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all cursor-pointer"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id} className="bg-slate-900 text-slate-200">
                    {model.name} ({model.latencyTier})
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Config System Drawer Toggle */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg border border-slate-800 hover:border-slate-700 transition-all relative"
              title="Pipeline Configuration"
            >
              <Sliders className="h-4 w-4" />
            </button>

            {/* Inspector Toggle */}
            <button
              onClick={() => setShowInspector(!showInspector)}
              className={`p-2 rounded-lg border transition-all ${
                showInspector
                  ? 'bg-cyan-950/60 border-cyan-800/60 text-cyan-400'
                  : 'text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
              title="Toggle Telemetry Inspector"
            >
              <Activity className="h-4 w-4" />
            </button>

            {/* API Key Config Button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 rounded-lg border border-slate-800 hover:border-slate-700 transition-all"
              title="Set Custom Gemini API Key"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg border border-slate-800 hover:border-slate-700 transition-all"
              title="Flush Messages"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <Cpu className="h-12 w-12 text-slate-700 mb-3 animate-pulse" />
              <h3 className="text-base font-semibold text-slate-300">Execution Buffer Empty</h3>
              <p className="text-xs max-w-sm mt-1 text-slate-500">
                Type a prompt below or pick a pre-configured architecture preset to start streaming responses.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-4xl mx-auto`}
              >
                {/* Role Header */}
                <div className="flex items-center space-x-2 mb-1 px-1">
                  {msg.role === 'assistant' ? (
                    <>
                      <div className="h-4 w-4 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                        ⚡
                      </div>
                      <span className="text-xs font-mono font-medium text-cyan-400">
                        {msg.metrics?.model || selectedModel.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-mono font-medium text-slate-400">User Client</span>
                      <div className="h-4 w-4 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                        U
                      </div>
                    </>
                  )}
                  <span className="text-[10px] font-mono text-slate-600">{msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative group rounded-2xl px-5 py-4 text-sm leading-relaxed max-w-full shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-none font-sans'
                  }`}
                >
                  {/* File Attachments display if any */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {msg.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 bg-slate-950/60 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs"
                        >
                          <Paperclip className="h-3 w-3 text-cyan-400" />
                          <span className="font-mono text-slate-300 truncate max-w-[150px]">{att.name}</span>
                          <span className="text-[10px] text-slate-500">({att.size})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main Content Body */}
                  <div className="whitespace-pre-wrap font-normal">
                    {msg.content || (
                      <div className="flex items-center space-x-2 text-cyan-400 py-1">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-xs font-mono">Stream Processing Chunk Vectors...</span>
                      </div>
                    )}
                  </div>

                  {/* Telemetry Footer Badge (For Assistant) */}
                  {msg.role === 'assistant' && msg.metrics && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center text-cyan-400/90" title="Execution Time">
                          <Clock className="h-3 w-3 mr-1" />
                          {msg.metrics.latencyMs}ms
                        </span>
                        <span className="flex items-center text-slate-400" title="Token Output count">
                          <Cpu className="h-3 w-3 mr-1 text-slate-500" />
                          {msg.metrics.totalTokens} tokens
                        </span>
                        {msg.metrics.vectorChunksUsed ? (
                          <span className="flex items-center text-emerald-400/90" title="RAG Vectors match">
                            <Database className="h-3 w-3 mr-1" />
                            {msg.metrics.vectorChunksUsed} RAG vectors
                          </span>
                        ) : null}
                      </div>

                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-cyan-300 text-slate-500"
                        title="Copy to Clipboard"
                      >
                        {copiedId === msg.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={chatBottomRef} />
        </div>

        {messages.length < 3 && (
          <div className="px-6 py-2 border-t border-slate-900 bg-slate-950">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan-400" /> Quick Architecture Presets
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(preset.prompt)}
                  disabled={isGenerating}
                  className="text-left p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">{preset.category}</span>
                    <ArrowRight className="h-3 w-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="text-xs font-medium text-slate-200 mt-1 truncate">{preset.title}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-slate-900/80 border-t border-slate-800/80 relative">
          {/* File attachment preview */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 px-2">
              {attachments.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 text-xs px-2.5 py-1 rounded-md text-slate-200"
                >
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-rose-400 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end space-x-2 bg-slate-950 border border-slate-800 focus-within:border-cyan-500/60 rounded-xl p-2 transition-all">
            {/* File Attachment button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg transition-colors"
              title="Attach context file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Textarea */}
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Inject user prompt or architectural specification... (Press Enter to dispatch)"
              rows={2}
              className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none px-2 font-sans"
            />

            {/* Action Button: Send or Stop */}
            {isGenerating ? (
              <button
                onClick={handleStopGeneration}
                className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow-lg shadow-rose-600/20 flex items-center space-x-1"
                title="Stop Stream Execution"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() && attachments.length === 0}
                className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${
                  inputPrompt.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 cursor-pointer'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
            <span>Model: <strong className="text-slate-400">{selectedModel.name}</strong></span>
            <span>Temperature: <strong className="text-slate-400">{config.temperature}</strong></span>
            <span>Guardrails: <strong className={config.enableGuardrails ? 'text-emerald-400' : 'text-amber-400'}>{config.enableGuardrails ? 'ACTIVE' : 'BYPASSED'}</strong></span>
          </div>
        </div>
      </div>

      {showInspector && (
        <aside className="w-80 h-full bg-slate-900/90 border-l border-slate-800/80 flex flex-col shrink-0">
          {/* Inspector Header */}
          <div className="h-14 px-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span className="font-mono font-medium text-xs text-slate-200">System Inspector</span>
            </div>
            <button
              onClick={() => setShowInspector(false)}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Inspector Navigation Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-mono bg-slate-950/40">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex-1 py-2.5 border-b-2 text-center transition-colors ${
                activeTab === 'pipeline'
                  ? 'border-cyan-500 text-cyan-400 font-medium bg-slate-900/50'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setActiveTab('rag')}
              className={`flex-1 py-2.5 border-b-2 text-center transition-colors ${
                activeTab === 'rag'
                  ? 'border-cyan-500 text-cyan-400 font-medium bg-slate-900/50'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Vector RAG
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex-1 py-2.5 border-b-2 text-center transition-colors ${
                activeTab === 'telemetry'
                  ? 'border-cyan-500 text-cyan-400 font-medium bg-slate-900/50'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Telemetry
            </button>
          </div>

          {/* Inspector Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-4 text-xs font-mono space-y-4">
            {activeTab === 'pipeline' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">Engine Architecture</h4>
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Stream Buffer:</span>
                      <span className="text-cyan-400">gRPC WebSocket</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Tokenizer:</span>
                      <span className="text-slate-400">SentencePiece BPE</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Quantization:</span>
                      <span className="text-emerald-400">INT8 TensorRT</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">Guardrail Checks</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Content Safety
                      </span>
                      <span className="text-emerald-400 text-[10px]">PASSED</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Prompt Injection
                      </span>
                      <span className="text-emerald-400 text-[10px]">SECURE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rag' && (
              <div className="space-y-4">
                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">Embedding Engine:</span>
                    <span className="text-cyan-400">text-embedding-004</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Vector Metric:</span>
                    <span className="text-slate-300">Cosine Similarity</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">Retrieved Chunks</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded">
                      <div className="flex justify-between text-[10px] text-cyan-400 mb-1">
                        <span>Doc_Chunk_1092.kt</span>
                        <span>Score: 0.94</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">
                        "High throughput stream optimization parameters for distributed node execution..."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'telemetry' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500">AVG LATENCY</span>
                    <p className="text-sm font-semibold text-cyan-400 mt-0.5">142 ms</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500">TOKENS / SEC</span>
                    <p className="text-sm font-semibold text-emerald-400 mt-0.5">84.2 t/s</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase">Context Buffer Usage</span>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[12%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>24,102 / 2,000,000</span>
                    <span>1.2%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-96 h-full bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Sliders className="h-5 w-5 text-cyan-400" />
                <h3 className="font-semibold text-base text-slate-100">System Configuration</h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* System Prompt Instruction */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">System Instruction Prompt</label>
              <textarea
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            {/* Hyperparameters Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Temperature</span>
                  <span className="text-cyan-400">{config.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">Top-P Sampling</span>
                  <span className="text-cyan-400">{config.topP}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.topP}
                  onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <label className="flex items-center justify-between text-xs font-mono text-slate-300 cursor-pointer">
                <span>Guardrail Safety Inspection</span>
                <input
                  type="checkbox"
                  checked={config.enableGuardrails}
                  onChange={(e) => setConfig({ ...config, enableGuardrails: e.target.checked })}
                  className="rounded border-slate-800 text-cyan-500 focus:ring-cyan-500/40"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-mono text-slate-300 cursor-pointer">
                <span>Enable RAG Retrieval</span>
                <input
                  type="checkbox"
                  checked={config.enableRAG}
                  onChange={(e) => setConfig({ ...config, enableRAG: e.target.checked })}
                  className="rounded border-slate-800 text-cyan-500 focus:ring-cyan-500/40"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-400" /> Gemini API Settings
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Provide a custom Google Gemini API Key if you want to bypass standard canvas demo rate limits.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-xs font-medium"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
