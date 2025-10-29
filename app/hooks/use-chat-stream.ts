import { useState, useRef } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type UseChatStreamOptions = {
  onError?: (error: string) => void;
};

export function useChatStream({ onError }: UseChatStreamOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async (
    userMessage: Message,
    systemPrompt: string,
    existingMessages: Message[] = []
  ) => {
    // Add user message immediately
    const updatedMessages = [...existingMessages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setStreaming(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...updatedMessages,
          ],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      // Add empty assistant message that we'll update
      const assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages([...updatedMessages, assistantMessage]);
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        // Update the assistant message in real-time
        setMessages([
          ...updatedMessages,
          { role: 'assistant', content: assistantContent },
        ]);
      }

      setStreaming(false);
      return [...updatedMessages, { role: 'assistant', content: assistantContent }];
    } catch (err) {
      setStreaming(false);
      setLoading(false);

      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled
        return updatedMessages;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      onError?.(errorMessage);

      // Remove the user message on error
      setMessages(existingMessages);
      throw err;
    }
  };

  const cancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreaming(false);
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    streaming,
    sendMessage,
    cancelStream,
    setMessages,
  };
}
