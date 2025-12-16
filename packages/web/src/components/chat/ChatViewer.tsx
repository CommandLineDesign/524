import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Eye, Search } from 'lucide-react';
import React, { useState } from 'react';

interface Conversation {
  id: string;
  customerId: string;
  artistId: string;
  status: string;
  lastMessageAt: string;
  unreadCountCustomer: number;
  unreadCountArtist: number;
  archivedAt?: string;
  lastMessage?: {
    content?: string;
    messageType: string;
    sentAt: string;
  };
  customerName?: string;
  artistName?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  messageType: string;
  content?: string;
  images?: string[];
  bookingId?: string;
  sentAt: string;
  readAt?: string;
}

interface ChatViewerProps {
  conversations: Conversation[];
  loading?: boolean;
  onViewConversation: (conversationId: string) => Promise<{
    conversation: Conversation;
    messages: Message[];
  }>;
  onExportConversation?: (conversationId: string) => void;
  onSearch?: (query: string) => void;
}

export function ChatViewer({
  conversations,
  loading = false,
  onViewConversation,
  onExportConversation,
  onSearch,
}: ChatViewerProps) {
  const [selectedConversation, setSelectedConversation] = useState<{
    conversation: Conversation;
    messages: Message[];
  } | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingConversation, setViewingConversation] = useState(false);

  const handleViewConversation = async (conversation: Conversation) => {
    setViewingConversation(true);
    try {
      const data = await onViewConversation(conversation.id);
      setSelectedConversation(data);
      setViewDialogOpen(true);

      // Log admin access for audit trail
      console.log('Admin viewed conversation:', {
        conversationId: conversation.id,
        adminId: 'current-admin-id', // TODO: Get from auth context
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setViewingConversation(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const formatMessagePreview = (message?: { content?: string; messageType: string }) => {
    if (!message) return 'No messages';

    switch (message.messageType) {
      case 'image':
        return '📷 Image';
      case 'system':
        return message.content || 'System message';
      default:
        return message.content || 'Message';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chat Conversations</CardTitle>
          <CardDescription>
            View and monitor customer-artist conversations. All access is logged for audit purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Message</TableHead>
                  <TableHead>Unread</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading conversations...
                    </TableCell>
                  </TableRow>
                ) : conversations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No conversations found
                    </TableCell>
                  </TableRow>
                ) : (
                  conversations.map((conversation) => (
                    <TableRow key={conversation.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {conversation.customerName?.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {conversation.customerName || 'Customer'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ↔ {conversation.artistName || 'Artist'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(conversation.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">
                            {formatMessagePreview(conversation.lastMessage)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(conversation.lastMessageAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          C: {conversation.unreadCountCustomer} | A:{' '}
                          {conversation.unreadCountArtist}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewConversation(conversation)}
                                disabled={viewingConversation}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle>Conversation Details</DialogTitle>
                                <DialogDescription>
                                  Conversation between {conversation.customerName || 'Customer'} and{' '}
                                  {conversation.artistName || 'Artist'}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedConversation && (
                                <ConversationDetailView
                                  conversation={selectedConversation.conversation}
                                  messages={selectedConversation.messages}
                                  onExport={onExportConversation}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ConversationDetailViewProps {
  conversation: Conversation;
  messages: Message[];
  onExport?: (conversationId: string) => void;
}

function ConversationDetailView({ conversation, messages, onExport }: ConversationDetailViewProps) {
  return (
    <div className="space-y-4">
      {/* Conversation Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">
            {conversation.customerName || 'Customer'} ↔ {conversation.artistName || 'Artist'}
          </h3>
          <p className="text-sm text-gray-500">Started {formatDate(conversation.createdAt)}</p>
        </div>
        {onExport && (
          <Button variant="outline" size="sm" onClick={() => onExport(conversation.id)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="h-96 border rounded-lg p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No messages in this conversation</div>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isCustomer = message.senderRole === 'customer';
  const isSystem = message.messageType === 'system';

  return (
    <div className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isSystem
            ? 'bg-gray-100 text-gray-600 text-center'
            : isCustomer
              ? 'bg-blue-100 text-blue-900'
              : 'bg-green-100 text-green-900'
        }`}
      >
        {message.messageType === 'image' && message.images?.[0] ? (
          <div>
            <img src={message.images[0]} alt="" className="max-w-full h-auto rounded" />
            {message.content && <p className="mt-2 text-sm">{message.content}</p>}
          </div>
        ) : (
          <p className="text-sm">{message.content}</p>
        )}
        <div className={`text-xs mt-1 ${isSystem ? 'text-gray-500' : 'text-gray-400'}`}>
          {formatDate(message.sentAt)}
          {message.readAt && <span className="ml-2">✓ Read</span>}
        </div>
      </div>
    </div>
  );
}
