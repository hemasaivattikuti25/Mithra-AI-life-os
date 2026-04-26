"""
Frontend Error Handling Hook (JavaScript/React)

Place this file as: client-app/client/src/hooks/useErrorHandler.js
"""

import { useState, useCallback } from 'react';

/**
 * Custom hook for proper error handling in async operations
 * 
 * Usage:
 * const { error, clearError, handleError } = useErrorHandler();
 * 
 * try {
 *   const data = await someAsyncOperation();
 * } catch (err) {
 *   handleError(err, 'Operation name');
 * }
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
    setErrorDetails(null);
  }, []);

  const handleError = useCallback((err, context = '', fallbackMessage = 'An error occurred') => {
    let message = fallbackMessage;
    let details = { original: String(err), context };

    if (err instanceof Error) {
      message = err.message;
      details.stack = err.stack;
    } else if (typeof err === 'object' && err !== null) {
      if (err.detail) message = err.detail;
      if (err.status) details.status = err.status;
      if (err.code) details.code = err.code;
    } else if (typeof err === 'string') {
      message = err;
    }

    setError(message);
    setErrorDetails(details);

    // Log for debugging
    console.error(`[${context}]`, {
      message,
      ...details,
    });

    return message;
  }, []);

  return {
    error,
    errorDetails,
    clearError,
    handleError,
    hasError: !!error,
  };
};

/**
 * Hook for retrying failed async operations with exponential backoff
 * 
 * Usage:
 * const { execute, isRetrying } = useRetry({ maxRetries: 3 });
 * 
 * const handleFetch = async () => {
 *   await execute(() => apiFetch('/data'));
 * };
 */
export const useRetry = ({ maxRetries = 3, initialDelay = 500, maxDelay = 10000 } = {}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const { handleError } = useErrorHandler();

  const execute = useCallback(async (fn, context = '') => {
    let delay = initialDelay;
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setIsRetrying(attempt > 0);
        return await fn();
      } catch (err) {
        lastError = err;

        if (attempt < maxRetries) {
          console.warn(`Attempt ${attempt + 1} failed (${context}). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * 2, maxDelay);
        }
      }
    }

    setIsRetrying(false);
    const msg = handleError(lastError, `${context} (${maxRetries + 1} attempts failed)`);
    throw lastError;
  }, [maxRetries, initialDelay, maxDelay, handleError]);

  return { execute, isRetrying };
};

/**
 * Hook for tracking async operation state (loading, error, data)
 * 
 * Usage:
 * const { data, loading, error, execute } = useAsyncOperation();
 * 
 * useEffect(() => {
 *   execute(() => apiFetch('/data'));
 * }, []);
 */
export const useAsyncOperation = (initialState = null) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const execute = useCallback(async (fn, context = 'Operation') => {
    try {
      setLoading(true);
      clearError();
      const result = await fn();
      setData(result);
      return result;
    } catch (err) {
      handleError(err, context);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  return { data, loading, error, execute, clearError };
};

export default useErrorHandler;
