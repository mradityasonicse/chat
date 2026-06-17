import { create } from 'zustand';
import { Conversation, Message } from '@/types';

interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  
  fetchConversations: (token: string) => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  fetchMessages: (conversationId: string, token: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, token: string) => Promise<void>;
  createConversation: (participantIds: string[], token: string) => Promise<void>;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,

  fetchConversations: async (token: string) => {
    set({ loading: true });
    try {
      const response = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        set({ conversations: data });
      }
    } finally {
      set({ loading: false });
    }
  },

  selectConversation: (conversation: Conversation) => {
    set({ currentConversation: conversation, messages: [] });
  },

  fetchMessages: async (conversationId: string, token: string) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        set({ messages: data });
      }
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (conversationId: string, content: string, token: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      if (response.ok) {
        const message = await response.json();
        set({ messages: [...get().messages, message] });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  createConversation: async (participantIds: string[], token: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ participantIds })
      });
      if (response.ok) {
        const conversation = await response.json();
        set({ conversations: [conversation, ...get().conversations] });
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  },

  addMessage: (message: Message) => {
    set({ messages: [...get().messages, message] });
  }
}));
