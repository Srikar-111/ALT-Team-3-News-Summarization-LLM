import { useState } from 'react';
import type { SummarizationRequest, SummarizationResponse } from '@/lib/types';

export function useSummarize() {
  const [response, setResponse] = useState<SummarizationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitArticle = async (request: SummarizationRequest) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    try {
      let endpoint = '/api/summarize';
      let isCloud = false;
      let cloudUrl = '';
      if (typeof window !== 'undefined') {
        const customUrl = localStorage.getItem('backend_url');
        if (customUrl) {
          isCloud = true;
          cloudUrl = customUrl.replace(/\/$/, '');
          endpoint = `${cloudUrl}/api/summarize`;
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const rawText = await res.text();

      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        try {
          const data = JSON.parse(rawText);
          errorMsg = data.error || data.detail || errorMsg;
        } catch {
          if (rawText && rawText.includes('Internal Server Error')) {
            errorMsg = isCloud
              ? 'Colab GPU server is not reachable. Please check if the Colab cell is running and your tunnel URL is active.'
              : 'Local backend is not reachable on port 8000.';
          } else if (rawText) {
            errorMsg = rawText.trim();
          }
        }
        throw new Error(errorMsg);
      }

      const data: SummarizationResponse = JSON.parse(rawText);
      setResponse(data);
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        const customUrl = typeof window !== 'undefined' ? localStorage.getItem('backend_url') : null;
        if (customUrl) {
          setError(`Cannot reach Colab GPU at ${customUrl}. Please check if the Colab notebook cell is running, or paste the new tunnel URL into 'Connect Colab GPU'.`);
        } else {
          setError('Backend server is not reachable. If you are using Google Colab, click "Connect Colab GPU" at top right and paste your tunnel URL.');
        }
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResponse(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    response,
    isLoading,
    error,
    submitArticle,
    reset,
  };
}
