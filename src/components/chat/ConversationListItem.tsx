import React from 'react';
import { Conversation, Participant, Message } from '@/types';

interface ConversationListItemProps {
  conversation: Conversation & {
    participants: (Participant & { user: any })[];
    messages: Message[];
  };
  isSelected?: boolean;
  onClick?: () => void;
}

export function ConversationListItem({
  conversation,
  isSelected = false,
  onClick
}: ConversationListItemProps) {
  const lastMessage = conversation.messages?.[0];
  const otherParticipants = conversation.participants.filter(
    (p) => typeof window !== 'undefined' // Mock check for current user
  );

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg mb-2 transition ${
        isSelected
          ? 'bg-brand-500/20 border border-brand-500/50'
          : 'hover:bg-slate-800 border border-transparent'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">
            {otherParticipants.map((p) => p.user.profile?.displayName).join(', ')}
          </p>
          {lastMessage && (
            <p className="text-sm text-slate-400 truncate">{lastMessage.content}</p>
          )}
        </div>
      </div>
    </button>
  );
}
