'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      await onSendMessage(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-slate-800">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        disabled={isLoading}
        className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:border-brand-500 focus:outline-none"
      />
      <Button type="submit" loading={isLoading}>
        Send
      </Button>
    </form>
  );
}
