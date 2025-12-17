# Admin Dashboard Features

## Overview

The admin dashboard provides comprehensive oversight of the messaging system, allowing administrators to monitor conversations, view message history, and maintain platform integrity. All admin access is logged for audit purposes.

## Access Control

### Role Requirements

Admin access requires the `admin` role in the user's role array. The system checks for admin privileges on all admin endpoints.

```typescript
// packages/api/src/middleware/auth.ts
export const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.user?.roles?.includes('admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

### Audit Logging

All admin access to messaging data is logged in the audit log table:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Chat Viewer Interface

### Main Dashboard

The chat viewer displays all conversations with search and filtering capabilities.

```typescript
// packages/web/src/components/chat/ChatViewer.tsx
export function ChatViewer({
  conversations,
  loading,
  onViewConversation,
  onExportConversation,
  onSearch
}: ChatViewerProps) {
  // Implementation with conversation list and search
}
```

### Conversation List

Displays conversations in a sortable table with key information:

| Column | Description |
|--------|-------------|
| Participants | Customer ↔ Artist names |
| Status | Active/Archived/Blocked |
| Last Message | Preview of most recent message |
| Unread Count | Unread messages for each participant |
| Actions | View conversation, Export |

### Search and Filtering

```typescript
const [searchQuery, setSearchQuery] = useState('');

const handleSearch = (query: string) => {
  setSearchQuery(query);
  // Filter conversations by participant names or message content
};
```

## Conversation Detail View

### Message History

Displays full message history with pagination:

```typescript
interface ConversationDetailViewProps {
  conversation: Conversation;
  messages: Message[];
  onExport?: (conversationId: string) => void;
}

function ConversationDetailView({
  conversation,
  messages,
  onExport
}: ConversationDetailViewProps) {
  // Display conversation metadata and message list
}
```

### Message Display

Messages are displayed in a chat-like interface with:

- **Sender identification**: Customer/Artist labels
- **Message types**: Text, images, system messages
- **Timestamps**: Full date/time formatting
- **Read status**: Visual indicators for read messages
- **System messages**: Styled differently for booking updates

### Pagination

Messages are paginated with "Load More" functionality:

```typescript
const PAGE_SIZE = 50;

const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMoreMessages = async () => {
  const nextPage = page + 1;
  const response = await api.get(
    `/admin/conversations/${conversationId}/messages`,
    { params: { limit: PAGE_SIZE, offset: nextPage * PAGE_SIZE } }
  );

  if (response.data.messages.length < PAGE_SIZE) {
    setHasMore(false);
  }

  setMessages(prev => [...prev, ...response.data.messages]);
  setPage(nextPage);
};
```

## Export Functionality

### Conversation Export

Administrators can export conversations as PDF for record-keeping:

```typescript
const exportConversation = async (conversationId: string) => {
  const response = await api.get(`/admin/conversations/${conversationId}/messages`, {
    params: { limit: 1000 } // Get all messages
  });

  const { conversation, messages } = response.data;

  // Generate PDF with conversation details
  const pdfContent = generateConversationPDF(conversation, messages);
  downloadPDF(pdfContent, `conversation-${conversationId}.pdf`);
};
```

### Export Format

PDF exports include:
- Conversation metadata (participants, dates)
- Complete message history
- Message timestamps and read status
- System messages for booking context
- Admin export timestamp and admin identifier

## Audit Trail

### Access Logging

Every admin access is logged with:

```typescript
const logAdminAccess = async (
  adminId: string,
  action: string,
  conversationId?: string,
  details?: any
) => {
  await auditLogRepository.createAuditLog({
    userId: adminId,
    action,
    resourceType: 'conversation',
    resourceId: conversationId,
    details: {
      action,
      conversationId,
      ...details,
    },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });
};
```

### Logged Actions

- `VIEW_CONVERSATIONS_LIST`: Accessing conversation list
- `VIEW_CONVERSATION`: Viewing specific conversation details
- `VIEW_CONVERSATION_MESSAGES`: Viewing message history
- `EXPORT_CONVERSATION`: Exporting conversation to PDF

### Audit Log Queries

```sql
-- View admin access to conversations
SELECT
  al.created_at,
  u.name as admin_name,
  al.action,
  al.resource_id as conversation_id,
  al.details
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.resource_type = 'conversation'
ORDER BY al.created_at DESC;

-- Most accessed conversations
SELECT
  resource_id,
  COUNT(*) as access_count,
  MAX(created_at) as last_accessed
FROM audit_logs
WHERE resource_type = 'conversation'
  AND action = 'VIEW_CONVERSATION'
GROUP BY resource_id
ORDER BY access_count DESC;
```

## Dispute Resolution

### Identifying Disputes

Administrators can identify potential disputes by:

1. **High message volume**: Conversations with many messages
2. **Negative sentiment**: Keyword analysis (future feature)
3. **Unusual patterns**: Rapid back-and-forth messaging
4. **User reports**: Integration with reporting system (future)

### Resolution Workflow

```typescript
const handleDispute = async (conversationId: string, resolution: string) => {
  // Log dispute resolution
  await logAdminAccess(adminId, 'RESOLVE_DISPUTE', conversationId, {
    resolution,
    timestamp: new Date().toISOString(),
  });

  // Send system message to conversation
  await messageService.sendSystemMessage(
    conversationId,
    `Dispute resolved by administrator: ${resolution}`,
    null
  );

  // Update conversation status if needed
  await conversationService.updateConversationStatus(conversationId, 'resolved');
};
```

## Security Features

### Read-Only Access

Admin users have read-only access to conversations:

- Cannot send messages through admin interface
- Cannot delete or modify existing messages
- Cannot archive conversations on behalf of users
- All actions are logged and auditable

### Data Privacy

- Personal information is masked in logs
- Full message content is only accessible to authorized admins
- Export files include admin watermarking
- Access logs are retained for compliance

## Performance Monitoring

### Admin Dashboard Metrics

```typescript
const adminMetrics = {
  totalConversations: 0,
  activeConversations: 0,
  messagesLast24h: 0,
  adminAccessCount: 0,
  averageResponseTime: 0,
};

const updateMetrics = async () => {
  // Query database for real-time metrics
  const metrics = await db.query(adminMetricsQuery);
  setAdminMetrics(metrics);
};
```

### System Health

Monitor admin dashboard performance:

- Page load times
- API response times
- Search query performance
- Export generation time

## Integration Points

### User Management

Link to user profiles from conversations:

```typescript
const viewUserProfile = (userId: string) => {
  navigation.navigate('/admin/users', { userId });
};
```

### Booking Context

Display booking information for messages:

```typescript
const getBookingContext = async (bookingId: string) => {
  const booking = await bookingService.getBookingById(bookingId);
  return {
    service: booking.serviceType,
    date: booking.scheduledDate,
    status: booking.status,
  };
};
```

### Notification System

Future integration for dispute alerts:

```typescript
const notifyAdminOfDispute = async (conversationId: string) => {
  await notificationService.sendAdminNotification({
    type: 'dispute_alert',
    conversationId,
    priority: 'high',
  });
};
```

## API Endpoints

### GET /admin/conversations
List all conversations with pagination.

**Parameters:**
- `limit` (default: 20, max: 100)
- `offset` (default: 0)
- `search` (optional): Search query

### GET /admin/conversations/:id
Get conversation details.

### GET /admin/conversations/:id/messages
Get message history with pagination.

**Parameters:**
- `limit` (default: 50, max: 100)
- `offset` (default: 0)

### POST /admin/conversations/:id/export
Export conversation to PDF.

## User Interface

### Responsive Design

The admin interface is fully responsive:

```css
.chat-viewer {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  height: 100vh;
}

@media (max-width: 768px) {
  .chat-viewer {
    grid-template-columns: 1fr;
  }
}
```

### Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for dialogs

## Testing

### Admin Interface Testing

```typescript
describe('ChatViewer', () => {
  it('displays conversations correctly', () => {
    render(<ChatViewer conversations={mockConversations} />);
    expect(screen.getByText('Customer Name')).toBeInTheDocument();
  });

  it('handles conversation viewing', async () => {
    const mockOnView = jest.fn();
    render(<ChatViewer onViewConversation={mockOnView} />);

    fireEvent.click(screen.getByText('View'));
    await waitFor(() => {
      expect(mockOnView).toHaveBeenCalled();
    });
  });
});
```

### Audit Logging Testing

```typescript
describe('Admin Audit Logging', () => {
  it('logs conversation access', async () => {
    await request(app)
      .get('/admin/conversations/123')
      .set('Authorization', `Bearer ${adminToken}`);

    const logs = await db.query('SELECT * FROM audit_logs WHERE action = ?', ['VIEW_CONVERSATION']);
    expect(logs).toHaveLength(1);
  });
});
```

## Future Enhancements

### Advanced Features

1. **Real-time Monitoring**: Live conversation updates in admin dashboard
2. **Automated Alerts**: AI-powered dispute detection
3. **Bulk Actions**: Archive multiple conversations
4. **Analytics**: Conversation metrics and insights
5. **Moderation Tools**: Message deletion, user warnings

### Integration Opportunities

1. **CRM Integration**: Sync conversations with customer support systems
2. **Analytics Platforms**: Export conversation data for analysis
3. **Notification Systems**: Admin alerts for high-priority conversations
4. **Compliance Tools**: Automated data retention and deletion

This admin interface provides comprehensive oversight while maintaining user privacy and system security.