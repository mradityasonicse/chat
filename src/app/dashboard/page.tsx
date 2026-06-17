'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { ConversationListItem } from '@/components/chat/ConversationListItem';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout, loadFromStorage } = useAuthStore();
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

  const [mounted, setMounted] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login?from=/dashboard');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (token && mounted && isAuthenticated) {
      fetchConversations(token);
    }
  }, [token, mounted, isAuthenticated, fetchConversations]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length > 0 && token) {
        setSearching(true);
        try {
          const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          }
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, token]);

  const handleSelectConversation = async (conversation: any) => {
    selectConversation(conversation);
    if (token) {
      await fetchMessages(conversation.id, token);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (currentConversation && token) {
      await sendMessage(currentConversation.id, content, token);
    }
  };

  const handleCreateChat = async (userId: string) => {
    if (token) {
      await createConversation([userId], token);
      setShowSearchModal(false);
      setSearchQuery('');
    }
  };

  if (!mounted || !isAuthenticated) {
    return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="w-72 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-semibold text-white mb-4">Chat With You</h1>
          <Button
            className="w-full"
            onClick={() => setShowSearchModal(true)}
          >
            + New Chat
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-slate-800">
          <Card className="p-3">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Account</p>
              <p className="font-semibold text-white text-sm">{user?.profile?.displayName || user?.email}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="w-full text-xs"
              >
                Logout
              </Button>
            </div>
          </Card>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Conversations
          </h2>
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-500">No conversations yet</p>
          ) : (
            conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={currentConversation?.id === conversation.id}
                onClick={() => handleSelectConversation(conversation)}
              />
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                {currentConversation.participants
                  ?.filter((p) => p.userId !== user?.id)
                  .map((p) => p.user?.profile?.displayName || p.user?.email)
                  .join(', ')}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === user?.id}
                  />
                ))
              )}
            </div>

            {/* Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={loading}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md text-center">
              <div className="space-y-4">
                <div className="text-4xl">💬</div>
                <h3 className="text-lg font-semibold text-white">Select or start a conversation</h3>
                <p className="text-slate-400 text-sm">
                  Choose a conversation from the sidebar or create a new one
                </p>
                <Button className="w-full" onClick={() => setShowSearchModal(true)}>
                  Start New Chat
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Start a new chat</h3>
                <p className="text-sm text-slate-400">Search for a user</p>
              </div>

              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {searching ? (
                  <p className="text-sm text-slate-400 text-center py-4">Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    {searchQuery ? 'No users found' : 'Start typing to search'}
                  </p>
                ) : (
                  searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleCreateChat(result.id)}
                      className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                    >
                      <p className="font-medium text-white">
                        {result.profile?.displayName}
                      </p>
                      <p className="text-sm text-slate-400">{result.email}</p>
                    </button>
                  ))
                )}
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                }}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
