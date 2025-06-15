# Group Chat Implementation

This implementation provides a complete group chat system for the FreeFlow application based on the API specification in `main.txt`.

## Features

### Client-Side Implementation
- **Group Creation**: Create new chat groups with unique invite tokens
- **Group Joining**: Join existing groups using invite tokens
- **Real-time Messaging**: Send and receive messages in real-time using WebSocket
- **Group Management**: Leave groups and manage memberships
- **Modern UI**: Clean, responsive interface with React components

### API Integration
The client integrates with the following API endpoints as specified:

1. **Create Group**: `POST /api/groups/create?name=GroupName`
2. **Join Group**: `POST /api/groups/join/{token}`
3. **Leave Group**: `POST /api/groups/leave/{groupId}`
4. **WebSocket Messaging**: Subscribe to `/topic/group/{groupId}` and send to `/app/chat/send`

## File Structure

```
client/
├── lib/
│   └── GroupChatService.ts          # Main service for API and WebSocket communication
├── components/GroupChat/
│   ├── GroupChatMain.tsx           # Main component with tabs for create/join
│   ├── GroupCreator.tsx            # Component to create new groups
│   ├── GroupJoiner.tsx             # Component to join existing groups
│   └── GroupChatRoom.tsx           # Chat room interface
├── components/ui/
│   └── tabs.tsx                    # UI component for tabbed interface
└── app/
    └── group-chat/
        └── page.tsx                # Group chat page
```

## Key Components

### GroupChatService
Core service that handles:
- WebSocket connection management using STOMP over SockJS
- API calls for group operations
- Message subscription and publishing
- Connection state management

### GroupChatMain
Main interface that provides:
- Tabbed interface for creating vs joining groups
- Connection status monitoring
- Navigation between group selection and chat room

### GroupChatRoom
Full-featured chat interface with:
- Real-time message display
- Message sending capabilities
- Invite link sharing
- Group leaving functionality
- User-friendly message formatting with timestamps

## Usage

1. **Access Group Chat**: Navigate to `/group-chat` (requires authentication)

2. **Create a Group**:
   - Enter a group name
   - Click "Create Group"
   - Share the generated invite token with others

3. **Join a Group**:
   - Obtain an invite token from a group creator
   - Enter the token in the "Join Group" tab
   - Click "Join Group"

4. **Chat in Group**:
   - Send messages in real-time
   - View messages from all group members
   - Copy invite link to share with others
   - Leave group when done

## Configuration

### WebSocket Configuration
The service connects to WebSocket at `http://localhost:8080/ws` by default. Update the `baseUrl` in `GroupChatService.ts` to match your backend server.

### Authentication
Uses Clerk authentication with email addresses as user IDs, matching the API specification's `X-User-Id` header requirement.

## Dependencies

### New Dependencies Added
- `@stomp/stompjs`: STOMP client for WebSocket communication
- `sockjs-client`: SockJS client for WebSocket fallback
- `@radix-ui/react-tabs`: Accessible tabs component
- `@types/sockjs-client`: TypeScript definitions

### Existing Dependencies Used
- React and Next.js for the frontend framework
- Clerk for authentication
- Tailwind CSS and shadcn/ui for styling
- Lucide React for icons

## Integration with Existing App

The group chat functionality integrates seamlessly with the existing FreeFlow application:

1. **Navigation**: Added group chat links to the main navbar
2. **Authentication**: Uses existing Clerk authentication system
3. **Styling**: Follows the existing design system and theme
4. **Routing**: Integrated with Next.js app router

## Backend Requirements

The client expects a Spring Boot backend with:
- WebSocket configuration with STOMP support
- REST endpoints matching the API specification
- CORS configuration for cross-origin requests
- Session management for group memberships

## Error Handling

The implementation includes comprehensive error handling:
- Connection failures with retry logic
- API errors with user-friendly messages
- Invalid invite tokens
- Network disconnection handling
- Toast notifications for user feedback

## Real-time Features

- **Live Messaging**: Messages appear instantly for all group members
- **Connection Status**: Visual indicators for connection state
- **Auto-reconnection**: Automatic reconnection on connection loss
- **Subscription Management**: Proper cleanup of WebSocket subscriptions

This implementation provides a production-ready group chat system that can be easily extended with additional features like file sharing, message history, or user presence indicators.
