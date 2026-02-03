import { apiService } from './api';

export interface FriendConnection {
    connectionId: number;
    userId: number;
    fullName: string;
    avatarUrl?: string;
    onlineStatus?: 'Online' | 'Offline' | 'Busy';
    isCallEligible?: boolean;
}

export interface ConnectionsData {
    pendingRequests: FriendConnection[];
    sentRequests: FriendConnection[];
    friends: FriendConnection[];
}

export const connectionsService = {
    getConnections: async (): Promise<ConnectionsData> => {
        return await apiService.get<ConnectionsData>('/connections');
    },

    sendRequest: async (recipientId: number): Promise<void> => {
        await apiService.post('/connections/request', { recipientId });
    },

    acceptRequest: async (connectionId: number): Promise<void> => {
        await apiService.post(`/connections/accept/${connectionId}`);
    },

    rejectRequest: async (connectionId: number): Promise<void> => {
        await apiService.post(`/connections/reject/${connectionId}`);
    }
};

export default connectionsService;
