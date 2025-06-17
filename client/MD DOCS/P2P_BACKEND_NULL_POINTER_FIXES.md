# P2P Backend NullPointerException Fixes

## Problem Summary
The backend was crashing with NullPointerExceptions when handling WebRTC signaling messages (offers, answers, ICE candidates) because it was trying to access fields that either didn't exist or were null in the JSON messages.

## Root Cause Analysis

### Error Pattern
```
java.lang.NullPointerException: Cannot invoke "com.fasterxml.jackson.databind.JsonNode.asText()" because the return value of "com.fasterxml.jackson.databind.JsonNode.get(String)" is null
```

### Frontend Message Format
The frontend sends messages with this structure:
```json
{
  "type": "offer|answer|ice-candidate",
  "fromUserId": "userId1",
  "toUserId": "userId2",
  "sdp": {...},
  "candidate": {...},
  "data": {
    // Additional fields for compatibility
  }
}
```

### Backend Parsing Issues
The backend was:
1. Calling `.asText()` on null JsonNode objects
2. Not checking if fields exist before accessing them
3. Not handling the case where `data` field might be null or missing

## Implemented Solutions

### 1. Robust Null Checking
Added comprehensive null checking in all handlers:
```java
if (jsonNode.has("data") && jsonNode.get("data") != null && !jsonNode.get("data").isNull()) {
    JsonNode dataNode = jsonNode.get("data");
    if (dataNode.has("targetId") && !dataNode.get("targetId").isNull()) {
        targetId = dataNode.get("targetId").asText();
    }
}
```

### 2. Fallback Field Resolution
Implemented fallback logic to try multiple field name patterns:
```java
// Try data structure first (old format)
if (targetId == null && jsonNode.has("toUserId") && !jsonNode.get("toUserId").isNull()) {
    targetId = jsonNode.get("toUserId").asText();
}
```

### 3. Enhanced Error Logging
Added detailed error messages showing exact field values and message content:
```java
if (targetId == null || fromId == null) {
    System.err.println("Invalid message format - missing required fields: targetId=" + targetId + ", fromId=" + fromId);
    System.err.println("Message: " + jsonNode.toString());
    return;
}
```

## Files Modified

### Backend Changes
- **File**: `p2p-module/src/main/java/com/mini_project/p2p_chat/socket_communication/SignalingHandler.java`
- **Methods Updated**:
  - `handleOffer()` - Fixed null pointer access
  - `handleAnswer()` - Fixed null pointer access
  - `handleIceCandidate()` - Fixed null pointer access

### Key Improvements
1. **Null Safety**: All field accesses now check for null before calling `.asText()`
2. **Field Existence**: Check if fields exist using `.has()` before accessing
3. **Multiple Format Support**: Support both old video call format and new P2P chat format
4. **Graceful Degradation**: If parsing fails, log error and continue instead of crashing
5. **Debug Information**: Enhanced logging to help identify parsing issues

## Testing Recommendations

### 1. Backend Stability Test
- Start backend server
- Monitor logs for any NullPointerExceptions
- Backend should handle malformed messages gracefully

### 2. Frontend-Backend Communication Test
- Open two browser windows with different users
- Attempt P2P connection
- Check backend logs for successful message forwarding:
  ```
  Received offer from user1 for user: user2
  Forwarded offer to user: user2
  Received answer from user2 for user: user1
  Forwarded answer to user: user1
  Received ICE candidate from user1 for user: user2
  Forwarded ICE candidate to user: user2
  ```

### 3. Connection Establishment Test
- Verify WebRTC data channels are established
- Test sending messages through P2P connection
- Monitor connection state changes

## Expected Behavior After Fixes

1. **No Backend Crashes**: Backend should continue running even with malformed messages
2. **Proper Message Forwarding**: All valid offer/answer/ICE candidate messages should be forwarded
3. **Clear Error Logging**: Invalid messages should be logged with details but not crash server
4. **Successful P2P Connections**: Users should be able to establish WebRTC connections

## Next Steps
1. Restart backend server to apply changes
2. Test P2P connections between two users
3. Monitor logs for any remaining issues
4. If connections still fail, investigate network/firewall issues

## Code Quality Improvements
- Added defensive programming practices
- Improved error handling and logging
- Better separation of concerns between old and new message formats
- Enhanced debugging capabilities
