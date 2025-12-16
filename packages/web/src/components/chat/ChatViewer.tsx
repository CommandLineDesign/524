import React from 'react';
import { Button } from 'react-admin';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface Conversation {
  id: string;
  customerId: string;
  artistId: string;
  status: string;
  lastMessageAt: string;
  unreadCountCustomer: number;
  unreadCountArtist: number;
  archivedAt?: string;
  createdAt: string;
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return {
          backgroundColor: '#dcfce7',
          color: '#166534',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
        };
      case 'archived':
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
        };
      case 'blocked':
        return {
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
        };
      default:
        return {
          backgroundColor: '#f9fafb',
          color: '#6b7280',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
        };
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Chat Conversations</h2>
        <p style={{ marginBottom: '20px', color: '#6b7280' }}>
          View and monitor customer-artist conversations. All access is logged for audit purposes.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>No conversations found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                    Participants
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                    Last Message
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Unread</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((conversation) => (
                  <tr key={conversation.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                          }}
                        >
                          {conversation.customerName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {conversation.customerName || 'Customer'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            ↔ {conversation.artistName || 'Artist'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={getStatusStyle(conversation.status)}>{conversation.status}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontSize: '14px' }}>
                          {formatMessagePreview(conversation.lastMessage)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {formatDate(conversation.lastMessageAt)}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: '14px' }}>
                        C: {conversation.unreadCountCustomer} | A: {conversation.unreadCountArtist}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Button
                        label="View"
                        onClick={() => onViewConversation(conversation.id)}
                        size="small"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
