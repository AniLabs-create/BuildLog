import React, { useState } from 'react';
import type { PortfolioData, AIAgentResponse } from '../../types/portfolio';
import { sendAIChat, applyAIAction } from '../../services/portfolios';

interface PortfolioAIAssistantProps {
  portfolioId: number;
  currentData: PortfolioData;
  onDataUpdated: (updatedData: PortfolioData) => void;
  onRequestProUpgrade: () => void;
  isProUser: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  action?: AIAgentResponse['action'];
  applied?: boolean;
}

export const PortfolioAIAssistant: React.FC<PortfolioAIAssistantProps> = ({
  portfolioId,
  currentData,
  onDataUpdated,
  onRequestProUpgrade,
  isProUser,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hi! I'm your BuildLog AI Portfolio Agent. I can help rewrite your copy, reorganize projects, tune themes, or switch between 20 templates. What would you like to improve?",
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [applyingAction, setApplyingAction] = useState<string | null>(null);

  const quickPrompts = [
    'Make hero punchy for senior backend roles',
    'Switch template to Terminal',
    'Polish about section to highlight systems architecture',
    'Switch template to Cyberpunk with cyan accents',
    'Select Minimal template with emerald accents',
  ];

  const handleSend = async (userPromptText?: string) => {
    const textToSend = userPromptText || prompt;
    if (!textToSend.trim() || loading) return;

    if (!isProUser) {
      onRequestProUpgrade();
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const resp = await sendAIChat(portfolioId, textToSend, currentData);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: resp.message || 'I have analyzed your request and prepared this recommendation:',
        action: resp.action,
        applied: false,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        onRequestProUpgrade();
      } else {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `⚠️ Error: ${err?.response?.data?.detail || err?.message || 'Could not process AI request'}`,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAction = async (msgId: string, action: NonNullable<AIAgentResponse['action']>) => {
    setApplyingAction(msgId);
    try {
      const updated = await applyAIAction(portfolioId, action);
      onDataUpdated(updated);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
      );
    } catch (err: any) {
      alert(`Failed to apply changes: ${err?.response?.data?.detail || err?.message}`);
    } finally {
      setApplyingAction(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Assistant Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs shadow-md">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-xs">Portfolio Agent</span>
              <span className="rounded bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.2 text-[10px] font-bold text-purple-300">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-zinc-400">Powered by BuildLog Intelligence</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Action Proposal Card */}
              {msg.action && (
                <div className="mt-3 rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-purple-300">
                    <span>ACTION: {msg.action.type}</span>
                    {msg.applied ? (
                      <span className="text-emerald-400 font-bold">✓ Applied</span>
                    ) : (
                      <span className="text-amber-400">Ready to apply</span>
                    )}
                  </div>

                  {msg.action.rationale && (
                    <p className="text-[11px] text-zinc-300 italic">
                      "{msg.action.rationale}"
                    </p>
                  )}

                  <pre className="text-[10px] font-mono bg-zinc-950 p-2 rounded border border-zinc-800 text-zinc-400 overflow-x-auto max-h-32">
                    {JSON.stringify(msg.action.payload, null, 2)}
                  </pre>

                  {!msg.applied && (
                    <button
                      type="button"
                      disabled={applyingAction === msg.id}
                      onClick={() => handleApplyAction(msg.id, msg.action!)}
                      className="w-full mt-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 py-1.5 text-xs font-bold text-zinc-950 transition disabled:opacity-50"
                    >
                      {applyingAction === msg.id ? 'Applying...' : 'Apply This Change'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-400 font-mono animate-pulse">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <span>Agent is reasoning and preparing adjustments...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 overflow-x-auto">
        <div className="flex gap-2">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(qp)}
              className="whitespace-nowrap rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1 text-[11px] text-zinc-400 hover:text-white hover:border-purple-500/50 transition"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask agent to polish copy, switch template, tune theme..."
            className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
