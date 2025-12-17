export type MessageType = 'text' | 'image' | 'system';

export interface ChatMessage {
  id: string;
  bookingId?: string;
  conversationId: string;
  senderId: string;
  senderRole: 'customer' | 'artist';
  messageType: MessageType;
  content: string;
  images?: string[];
  sentAt: string;
  readAt?: string;
}
