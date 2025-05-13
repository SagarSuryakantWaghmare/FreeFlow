// Defines the structure for message synchronization between peers
export interface SyncRequest {
  type: 'sync_request';
  lastMessageTimestamp: number | null; // Timestamp of the last message, null if no messages
}

export interface SyncResponse {
  type: 'sync_response';
  messages: {
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
  }[];
}
