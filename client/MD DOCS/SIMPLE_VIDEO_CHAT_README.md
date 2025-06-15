# Simple Video Chat Module

A lightweight, secure video chat system built for FreeFlow with room ownership controls and seamless device management.

## Features

### 🏠 Room Management
- **Create Rooms**: Generate unique room IDs with custom names
- **Owner Controls**: Room creators have full control over participants
- **Join Requests**: Users must request permission to join rooms
- **Approve/Reject**: Owners can approve or reject join requests in real-time

### 🎥 Video & Audio
- **HD Video Calls**: Crystal clear video quality
- **Audio Controls**: Professional audio with noise management
- **Media Toggle**: Turn video/audio on/off during calls
- **Real-time Stream**: Instant video and audio streaming between participants

### ⚙️ Device Management
- **Camera Selection**: Switch between multiple cameras during calls
- **Microphone Selection**: Choose from available microphones
- **Real-time Switching**: Change devices without interrupting the call
- **Device Detection**: Automatic detection of available media devices

### 🔒 Security & Privacy
- **Peer-to-Peer**: Direct connections between participants
- **WebRTC**: Industry-standard secure communication protocol
- **No Server Storage**: Media streams are not stored on servers
- **End-to-End**: Direct participant-to-participant communication

## Architecture

### Core Components

1. **SimpleVideoCallService** (`/lib/SimpleVideoCallService.ts`)
   - Central service managing all video call functionality
   - WebRTC peer connection management
   - WebSocket signaling for room coordination
   - Device management and media stream handling

2. **SimpleVideoCallLobby** (`/components/VideoCall/SimpleVideoCallLobby.tsx`)
   - Room creation and joining interface
   - Join request status management
   - User authentication and setup

3. **SimpleVideoCallRoom** (`/components/VideoCall/SimpleVideoCallRoom.tsx`)
   - Main video call interface
   - Participant video grid
   - Media controls and settings
   - Owner controls for managing participants

### Data Flow

```
User Actions → SimpleVideoCallService → WebSocket/WebRTC → Remote Participants
     ↓                    ↓                    ↓                    ↓
UI Updates ← Event System ← Signaling Server ← Peer Connections
```

## Usage

### Creating a Room

1. Navigate to `/video-call`
2. Click "Create Room" tab
3. Enter room name
4. Click "Create Room"
5. Share the generated Room ID with participants

### Joining a Room

1. Navigate to `/video-call`
2. Click "Join Room" tab
3. Enter the Room ID
4. Click "Request to Join"
5. Wait for room owner approval
6. Click "Enter Room" once approved

### Owner Controls

As a room owner, you can:
- **Approve/Reject Join Requests**: Manage who enters your room
- **Remove Participants**: Remove users from the room
- **Control Room Settings**: Manage room-wide settings

### Device Management

During a call:
1. Click the Settings (⚙️) button
2. Select from available cameras and microphones
3. Devices switch instantly without interrupting the call

## Technical Implementation

### WebRTC Setup
```typescript
// Automatic peer connection creation
const peerConnection = new RTCPeerConnection({ 
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ] 
});
```

### Media Device Switching
```typescript
// Switch camera during call
await simpleVideoCallService.switchCamera(deviceId);

// Switch microphone during call
await simpleVideoCallService.switchMicrophone(deviceId);
```

### Event System
```typescript
// Listen for room events
simpleVideoCallService.addEventListener('room_created', (room) => {
  console.log('Room created:', room);
});

simpleVideoCallService.addEventListener('user_joined', (participant) => {
  console.log('User joined:', participant);
});
```

## Integration

### Adding to Navigation

The video chat module is accessible via:
- **Main Route**: `/video-call` - Main lobby and room interface
- **Demo Route**: `/video-call/demo` - Feature showcase and information

### Navbar Integration

```tsx
<Link href="/video-call" className="nav-link">
  Video Call
</Link>
```

## API Reference

### SimpleVideoCallService Methods

#### Room Management
- `createRoom(roomName, ownerId, ownerName)` - Create a new room
- `joinRoom(roomId, userId, userName)` - Request to join a room
- `leaveRoom()` - Leave current room
- `getCurrentRoom()` - Get current room information

#### Owner Controls
- `approveJoinRequest(requestId, userId)` - Approve join request
- `rejectJoinRequest(requestId, userId)` - Reject join request
- `removeParticipant(userId)` - Remove participant from room

#### Media Controls
- `toggleVideo()` - Toggle video on/off
- `toggleAudio()` - Toggle audio on/off
- `getAvailableDevices()` - Get list of available media devices
- `switchCamera(deviceId)` - Switch to different camera
- `switchMicrophone(deviceId)` - Switch to different microphone

#### Utility Methods
- `isRoomOwner()` - Check if current user is room owner
- `getLocalStream()` - Get local media stream
- `getPendingJoinRequests()` - Get pending join requests (owner only)

### Events

The service emits the following events:

- `room_created` - Room successfully created
- `room_left` - User left the room
- `join_request_received` - New join request (owner only)
- `join_approved` - Join request approved
- `join_rejected` - Join request rejected
- `user_joined` - New user joined room
- `user_left` - User left room
- `local_stream` - Local media stream available
- `remote_stream` - Remote participant stream available
- `video_toggled` - Video enabled/disabled
- `audio_toggled` - Audio enabled/disabled
- `camera_switched` - Camera device changed
- `microphone_switched` - Microphone device changed

## File Structure

```
client/
├── app/
│   └── video-call/
│       ├── page.tsx              # Main video call page
│       └── demo/
│           └── page.tsx          # Demo and feature showcase
├── components/
│   └── VideoCall/
│       ├── SimpleVideoCallLobby.tsx    # Room creation/joining interface
│       └── SimpleVideoCallRoom.tsx     # Main video call room
└── lib/
    ├── SimpleVideoCallService.ts       # Core video call service
    └── utils/
        └── SafeLocalStorage.ts          # Safe localStorage utility
```

## Dependencies

- **React 18+** - UI framework
- **Next.js 15+** - Application framework
- **WebRTC** - Peer-to-peer communication
- **WebSocket** - Signaling for room coordination
- **Lucide React** - Icons
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## Browser Support

- **Chrome 88+** - Full support
- **Firefox 85+** - Full support
- **Safari 15+** - Full support
- **Edge 88+** - Full support

## Security Considerations

1. **Peer-to-Peer**: Direct connections reduce server-side attack vectors
2. **No Media Storage**: Streams are not recorded or stored on servers
3. **HTTPS Required**: WebRTC requires secure contexts
4. **STUN/TURN**: Uses public STUN servers (consider private TURN servers for production)

## Future Enhancements

- **Screen Sharing**: Share screen/applications during calls
- **File Sharing**: Send files during video calls
- **Chat Messages**: Text chat alongside video
- **Recording**: Record video calls locally
- **Virtual Backgrounds**: AI-powered background replacement
- **Breakout Rooms**: Split participants into smaller groups
- **Mobile App**: React Native mobile application
- **Desktop App**: Electron desktop application

## Development

### Running in Development
```bash
cd client
npm run dev
```

### Building for Production
```bash
cd client
npm run build
npm start
```

### Testing
```bash
cd client
npm run test
```

## Troubleshooting

### Common Issues

1. **Camera/Microphone Access Denied**
   - Ensure HTTPS is enabled
   - Check browser permissions
   - Allow media access when prompted

2. **Connection Issues**
   - Check internet connectivity
   - Verify WebSocket server is running
   - Ensure STUN servers are accessible

3. **Device Not Switching**
   - Verify device is available and not in use
   - Check browser permissions for new device
   - Refresh media permissions if needed

### Debug Mode

Enable debug logging:
```typescript
// In SimpleVideoCallService.ts
console.log('Debug mode enabled');
```

## License

This module is part of the FreeFlow project and follows the same licensing terms.
