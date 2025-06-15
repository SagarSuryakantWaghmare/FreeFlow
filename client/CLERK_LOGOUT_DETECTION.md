# Clerk Logout Detection & LocalStorage Cleanup

## Problem
When users log out using Clerk's `UserButton` component, the logout is handled internally by Clerk and doesn't trigger our custom cleanup functions. This resulted in localStorage data persisting after logout, creating privacy and security concerns.

## Solution
Implemented a custom React hook that detects when a user's authentication state changes from signed-in to signed-out, and automatically triggers cleanup.

### Implementation

#### 1. Custom Hook: `useClerkLogoutDetection`
**File**: `client/hooks/use-clerk-logout.ts`

- Uses Clerk's `useUser` hook to monitor authentication state
- Detects transition from signed-in to signed-out
- Automatically triggers comprehensive cleanup when logout is detected
- Returns `performLogoutCleanup` function for manual cleanup scenarios

#### 2. Integration in Navbar
**File**: `client/components/Navbar.tsx`

- Imports and uses the custom hook
- Provides both automatic cleanup (via hook) and manual cleanup (via logout buttons)
- Manual logout buttons still work for chat page scenarios

### Cleanup Actions Performed

When logout is detected, the following cleanup occurs:

#### Services Cleanup
- **WebSocket**: Disconnect all connections
- **Group Chat**: Clear all subscriptions and in-memory state

#### LocalStorage Cleanup
- **Single Chat Keys**: `chat_messages_*`, `unread_count_*`, `freeflow_blacklist_*`, `freeflow_connections_*`
- **Group Chat Keys**: `group_messages_*`, `group_unread_*`, `group_info_*`, `user_groups_*`, `group_join_requests`, `pending_group_approvals`, `group_connections`, `group_notifications`
- **User Data Keys**: `username`, `userId`, `user_real_name`

### Global Coverage

The solution works globally because:
1. The custom hook is used in the Navbar component
2. The Navbar is included in the root layout (`app/layout.tsx`)
3. All `UserButton` instances are in the Navbar
4. The hook monitors authentication state changes app-wide

### Benefits

1. **Automatic Cleanup**: No need for users to manually trigger cleanup
2. **Complete Privacy**: All user data is cleared on logout
3. **Security**: Prevents data persistence across sessions
4. **Reusable**: Hook can be used in other components if needed
5. **Comprehensive**: Covers both manual and Clerk-initiated logouts

### Testing

To verify the implementation:
1. Log in and use chat features (both single and group chat)
2. Log out using Clerk's UserButton
3. Check localStorage - should be completely cleared of app data
4. Log in again - no previous session data should persist
5. Test manual logout buttons - should also work correctly

### Compatibility

- Works with all Clerk logout methods (UserButton, programmatic logout, etc.)
- Maintains existing manual logout functionality
- No breaking changes to existing logout flows
- Compatible with both single chat and group chat features
