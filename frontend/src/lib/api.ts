import axios, { AxiosError } from 'axios';
import type {
  SummarizationRequest,
  SummarizationResponse,
  EvaluationRequest,
  EvaluationResponse,
  ExperimentRequest,
  ExperimentStatus,
  ExperimentResult,
  ModelInfo,
  HealthResponse,
  ErrorResponse,
  QualitativeScoreInput,
  EvaluationResult,
  ExtractUrlResponse,
} from './types';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 min — summarization can be slow on CPU
  headers: { 'Content-Type': 'application/json' },
});

// Dynamically use Colab Cloud URL if saved in localStorage
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('backend_url');
    if (customUrl) {
      config.baseURL = `${customUrl.replace(/\/$/, '')}/api`;
    }
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    let message =
      error.response?.data?.error ||
      error.response?.data?.detail;

    if (!message) {
      if (error.code === 'ERR_NETWORK') {
        const customUrl = typeof window !== 'undefined' ? localStorage.getItem('backend_url') : null;
        message = customUrl
          ? `Cannot reach Colab GPU at ${customUrl}. Check if Colab is running or update the URL.`
          : 'Network error: backend server is not reachable.';
      } else {
        message = error.message || 'An unexpected error occurred';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export async function healthCheck(): Promise<HealthResponse> {
  const { data } = await client.get<HealthResponse>('/health');
  return data;
}

export async function getModels(): Promise<ModelInfo[]> {
  const { data } = await client.get<ModelInfo[]>('/models');
  return data;
}

export async function summarize(request: SummarizationRequest): Promise<SummarizationResponse> {
  const { data } = await client.post<SummarizationResponse>('/summarize', request);
  return data;
}

export async function evaluate(request: EvaluationRequest): Promise<EvaluationResponse> {
  const { data } = await client.post<EvaluationResponse>('/evaluate', request);
  return data;
}

export async function submitQualitativeScore(score: QualitativeScoreInput): Promise<EvaluationResult> {
  const { data } = await client.post<EvaluationResult>('/qualitative-score', score);
  return data;
}

export async function startExperiment(request: ExperimentRequest): Promise<ExperimentStatus> {
  const { data } = await client.post<ExperimentStatus>('/experiment', request);
  return data;
}

export async function getExperimentStatus(experimentId: string): Promise<ExperimentStatus> {
  const { data } = await client.get<ExperimentStatus>(`/experiment/${experimentId}/status`);
  return data;
}

export async function getExperimentResults(experimentId: string): Promise<ExperimentResult> {
  const { data } = await client.get<ExperimentResult>(`/experiment/${experimentId}/results`);
  return data;
}

export async function extractArticleFromUrl(url: string): Promise<ExtractUrlResponse> {
  // Always route URL extraction directly to the local parser via Next.js proxy
  const res = await fetch('/api/extract-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const rawText = await res.text();
  if (!res.ok) {
    let errorMsg = `Extraction failed (${res.status})`;
    try {
      const data = JSON.parse(rawText);
      errorMsg = data.detail || data.error || errorMsg;
    } catch {
      if (rawText) errorMsg = rawText.trim();
    }
    throw new Error(errorMsg);
  }

  return JSON.parse(rawText);
}
