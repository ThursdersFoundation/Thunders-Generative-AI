'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ModelCard from '@/components/ModelCard';
import { useUIStore } from '@/stores/uiStore';
import type { AIModel, ModelType, ModelProvider, ModelStatus } from '@/types/model';
import clsx from 'clsx';

const MOCK_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'gpt-4o',
    displayName: 'GPT-4o',
    description: 'OpenAI\'s most advanced multimodal model with superior reasoning, vision, and coding capabilities.',
    type: 'multimodal',
    provider: 'openai',
    status: 'active',
    version: '2024-05',
    capabilities: { streaming: true, functionCalling: true, vision: true, codeExecution: true, maxTokens: 16384, contextWindow: 128000 },
    pricing: { inputPerMillion: 5, outputPerMillion: 15, currency: 'USD' },
    tags: ['flagship', 'multimodal'],
    createdAt: '2024-05-13T00:00:00Z',
    updatedAt: '2024-05-13T00:00:00Z',
    lastUsedAt: '2024-01-15T10:30:00Z',
    requestCount: 125000,
    avgLatencyMs: 92,
  },
  {
    id: 'claude-3-opus',
    name: 'claude-3-opus',
    displayName: 'Claude 3 Opus',
    description: 'Anthropic\'s most powerful model for highly complex tasks requiring deep analysis and nuanced reasoning.',
    type: 'llm',
    provider: 'anthropic',
    status: 'active',
    version: '2024-03',
    capabilities: { streaming: true, functionCalling: true, vision: true, codeExecution: false, maxTokens: 4096, contextWindow: 200000 },
    pricing: { inputPerMillion: 15, outputPerMillion: 75, currency: 'USD' },
    tags: ['premium', 'reasoning'],
    createdAt: '2024-03-04T00:00:00Z',
    updatedAt: '2024-03-04T00:00:00Z',
    lastUsedAt: '2024-01-15T09:15:00Z',
    requestCount: 87000,
    avgLatencyMs: 145,
  },
  {
    id: 'gemini-pro',
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    description: 'Google\'s latest model with a breakthrough 1M token context window and strong multimodal performance.',
    type: 'multimodal',
    provider: 'google',
    status: 'active',
    version: '2024-02',
    capabilities: { streaming: true, functionCalling: true, vision: true, codeExecution: true, maxTokens: 8192, contextWindow: 1000000 },
    pricing: { inputPerMillion: 3.5, outputPerMillion: 10.5, currency: 'USD' },
    tags: ['long-context', 'multimodal'],
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
    lastUsedAt: '2024-01-14T16:45:00Z',
    requestCount: 62000,
    avgLatencyMs: 110,
  },
  {
    id: 'dall-e-3',
    name: 'dall-e-3',
    displayName: 'DALL·E 3',
    description: 'OpenAI\'s latest image generation model with improved accuracy, detail, and text rendering in images.',
    type: 'image',
    provider: 'openai',
    status: 'active',
    version: '2023-11',
    capabilities: { streaming: false, functionCalling: false, vision: false, codeExecution: false, maxTokens: 1, contextWindow: 1 },
    pricing: { inputPerMillion: 40, outputPerMillion: 0, currency: 'USD' },
    tags: ['image-generation'],
    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2023-11-01T00:00:00Z',
    lastUsedAt: '2024-01-15T11:00:00Z',
    requestCount: 34000,
    avgLatencyMs: 4500,
  },
  {
    id: 'llama-3-70b',
    name: 'llama-3-70b',
    displayName: 'Llama 3 70B',
    description: 'Meta\'s open-source 70B parameter model with strong performance across benchmarks and coding tasks.',
    type: 'llm',
    provider: 'meta',
    status: 'active',
    version: '2024-04',
    capabilities: { streaming: true, functionCalling: true, vision: false, codeExecution: false, maxTokens: 4096, contextWindow: 8192 },
    pricing: { inputPerMillion: 0.8, outputPerMillion: 1.2, currency: 'USD' },
    tags: ['open-source', 'cost-effective'],
    createdAt: '2024-04-18T00:00:00Z',
    updatedAt: '2024-04-18T00:00:00Z',
    lastUsedAt: '2024-01-15T08:20:00Z',
    requestCount: 98000,
    avgLatencyMs: 68,
  },
  {
    id: 'whisper-v3',
    name: 'whisper-v3',
    displayName: 'Whisper V3',
    description: 'OpenAI\'s state-of-the-art speech recognition model supporting 99 languages with high accuracy.',
    type: 'audio',
    provider: 'openai',
    status: 'inactive',
    version: '2023-11',
    capabilities: { streaming: true, functionCalling: false, vision: false, codeExecution: false, maxTokens: 1, contextWindow: 1 },
    pricing: { inputPerMillion: 0.6, outputPerMillion: 0, currency: 'USD' },
    tags: ['audio', 'transcription'],
    createdAt: '2023-11-06T00:00:00Z',
    updatedAt: '2023-11-06T00:00:00Z',
    lastUsedAt: null,
    requestCount: 0,
    avgLatencyMs: 0,
  },
  {
    id: 'text-embedding-3',
    name: 'text-embedding-3-large',
    displayName: 'Text Embedding 3 Large',
    description: 'OpenAI\'s latest embedding model with 3072-dimensional vectors and improved retrieval performance.',
    type: 'embedding',
    provider: 'openai',
    status: 'active',
    version: '2024-01',
    capabilities: { streaming: false, functionCalling: false, vision: false, codeExecution: false, maxTokens: 8191, contextWindow: 8191 },
    pricing: { inputPerMillion: 0.13, outputPerMillion: 0, currency: 'USD' },
    tags: ['embedding', 'search'],
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
    lastUsedAt: '2024-01-15T07:00:00Z',
    requestCount: 210000,
    avgLatencyMs: 22,
  },
  {
    id: 'stable-video',
    name: 'stable-video-diffusion',
    displayName: 'Stable Video Diffusion',
    description: 'Stability AI\'s video generation model that creates short, high-quality video clips from images.',
    type: 'video',
    provider: 'custom',
    status: 'loading',
    version: '1.1',
    capabilities: { streaming: false, functionCalling: false, vision: false, codeExecution: false, maxTokens: 1, contextWindow: 1 },
    pricing: { inputPerMillion: 100, outputPerMillion: 0, currency: 'USD' },
    tags: ['video-generation', 'experimental'],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    lastUsedAt: null,
    requestCount: 0,
    avgLatencyMs: 0,
  },
];

type FilterKey = 'type' | 'provider' | 'status';

const FILTER_OPTIONS: Record<FilterKey, { label: string; value: string }[]> = {
  type: [
    { label: 'All Types', value: '' },
    { label: 'LLM', value: 'llm' },
    { label: 'Image', value: 'image' },
    { label: 'Audio', value: 'audio' },
    { label: 'Video', value: 'video' },
    { label: 'Embedding', value: 'embedding' },
    { label: 'Multimodal', value: 'multimodal' },
  ],
  provider: [
    { label: 'All Providers', value: '' },
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic', value: 'anthropic' },
    { label: 'Google', value: 'google' },
    { label: 'Meta', value: 'meta' },
    { label: 'Custom', value: 'custom' },
  ],
  status: [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Loading', value: 'loading' },
    { label: 'Error', value: 'error' },
  ],
};

export default function ModelsPage() {
  const { sidebarCollapsed } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<FilterKey, string>>({ type: '', provider: '', status: '' });
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  const filteredModels = useMemo(() => {
    return MOCK_MODELS.filter((model) => {
      const matchesSearch =
        !searchQuery ||
        model.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !filters.type || model.type === filters.type;
      const matchesProvider = !filters.provider || model.provider === filters.provider;
      const matchesStatus = !filters.status || model.status === filters.status;

      return matchesSearch && matchesType && matchesProvider && matchesStatus;
    });
  }, [searchQuery, filters]);

  const activeCount = MOCK_MODELS.filter((m) => m.status === 'active').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className={clsx('transition-all duration-300', sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64')}>
        <div className="p-4 lg:p-8 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Models</h1>
              <p className="text-muted-foreground">
                {activeCount} active · {MOCK_MODELS.length} total models
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Model
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {(Object.keys(FILTER_OPTIONS) as FilterKey[]).map((filterKey) => (
              <select
                key={filterKey}
                value={filters[filterKey]}
                onChange={(e) => setFilters((prev) => ({ ...prev, [filterKey]: e.target.value }))}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {FILTER_OPTIONS[filterKey].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>

          {/* Model Grid */}
          {filteredModels.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onSelect={setSelectedModel}
                  selected={selectedModel?.id === model.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
              <svg className="h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-4 text-sm font-medium">No models found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
