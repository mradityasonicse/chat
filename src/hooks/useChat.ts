import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';

export function useChat() {
  const { token } = useAuthStore();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    fetchConversations,
    selectConversation,
    fetchMessages,
    sendMessage,
    createConversation
  } = useChatStore();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchConversations(token).catch((err) => setError(err.message));
    }
  }, [token, fetchConversations]);

  const handleSelectConversation = async (conversation: any) => {
    selectConversation(conversation);
    if (token) {
      await fetchMessages(conversation.id, token).catch((err) => setError(err.message));
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversation || !token) return;
    await sendMessage(currentConversation.id, content, token).catch((err) =>
      setError(err.message)
    );
  };

  const handleCreateConversation = async (participantIds: string[]) => {
    if (!token) return;
    await createConversation(participantIds, token).catch((err) => setError(err.message));
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    selectConversation: handleSelectConversation,
    sendMessage: handleSendMessage,
    createConversation: handleCreateConversation
  };
}
