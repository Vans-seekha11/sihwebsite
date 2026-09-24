import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { LanguageCode } from '@/lib/i18n';

/**
 * Read-only operations assistant (supabase/functions/chat).
 *
 * The function runs every tool as the signed-in user, so the database decides
 * what the assistant may see. It streams plain text — no SSE framing — so this
 * reader needs no parser and no extra dependency.
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class ChatSignedOutError extends Error {
  constructor() {
    super('The assistant needs a live sign-in.');
  }
}

/** Server refused with a message meant for the user (403 no_role, 429, 502). */
export class ChatError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const FRIENDLY: Record<number, string> = {
  401: 'Your session has expired. Please sign in again.',
  413: 'That conversation is too long. Start a new one.',
  429: "You've asked a lot of questions this hour. Try again shortly.",
  502: 'The assistant is unavailable right now. Route risk and alerts still work.',
};

async function* streamChat(
  messages: ChatMessage[],
  language: LanguageCode,
  signal: AbortSignal,
): AsyncGenerator<string> {
  if (!supabase) throw new ChatSignedOutError();
  // Read at send time, not at load: supabase-js refreshes the token in the background.
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new ChatSignedOutError();

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ language, messages }),
  });

  if (!res.ok || !res.body) {
    let message = FRIENDLY[res.status] ?? `The assistant failed (HTTP ${res.status}).`;
    try {
      const body = await res.json();
      // no_role carries its own wording, matching auth.ts.
      if (body?.message) message = body.message;
    } catch {
      /* body wasn't JSON; keep the friendly default */
    }
    throw new ChatError(message, res.status);
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    if (value) yield value;
  }
}

/** Max turns sent to the server; it also slices to the same bound. */
const HISTORY = 12;

export interface UseChat {
  messages: ChatMessage[];
  /** True from send() until the stream ends. */
  streaming: boolean;
  /** True while streaming and no text has arrived yet (a tool call is running). */
  thinking: boolean;
  signedOut: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useChat(language: LanguageCode): UseChat {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  // Guards a stale stream from writing into a conversation the user has since reset.
  const seq = useRef(0);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const id = ++seq.current;
      const controller = new AbortController();
      abort.current = controller;

      const history: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
      setMessages([...history, { role: 'assistant', content: '' }]);
      setStreaming(true);
      setThinking(true);
      setError(null);

      let acc = '';
      try {
        for await (const chunk of streamChat(history.slice(-HISTORY), language, controller.signal)) {
          if (id !== seq.current) return;
          acc += chunk;
          setThinking(false);
          setMessages([...history, { role: 'assistant', content: acc }]);
        }
        if (id === seq.current && !acc) {
          setError('The assistant returned no answer. Try rephrasing.');
        }
      } catch (e) {
        if (id !== seq.current) return;
        if ((e as Error).name === 'AbortError') return; // user pressed stop; keep the partial text
        if (e instanceof ChatSignedOutError) setSignedOut(true);
        else if (acc) setError('The answer was cut off. Try again.'); // keep the partial text visible
        else setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (id === seq.current) {
          setStreaming(false);
          setThinking(false);
          // An empty assistant bubble is noise; drop it if nothing arrived.
          setMessages((m) => (m.at(-1)?.role === 'assistant' && !m.at(-1)!.content ? m.slice(0, -1) : m));
        }
      }
    },
    [messages, streaming, language],
  );

  const stop = useCallback(() => abort.current?.abort(), []);

  const reset = useCallback(() => {
    seq.current++;
    abort.current?.abort();
    setMessages([]);
    setStreaming(false);
    setThinking(false);
    setError(null);
  }, []);

  return { messages, streaming, thinking, signedOut, error, send, stop, reset };
}
