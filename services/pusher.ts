import Pusher, { Channel } from 'pusher-js';
import { PUSHER_CONFIG } from '../constants/Config';

class PusherService {
  private pusher: Pusher | null = null;
  private channels: Map<string, Channel> = new Map();
  private messageCallbacks: Map<string, (message: any) => void> = new Map();
  private typingCallbacks: Map<string, (isTyping: boolean, userId: string) => void> = new Map();

  constructor() {
    this.initializePusher();
  }

  private async initializePusher() {
    try {
      // Get auth token for Pusher authentication
      let authToken = null;
      try {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined' && window.localStorage) {
          authToken = localStorage.getItem('authToken');
        } else {
          // For server-side or React Native, try AsyncStorage
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          authToken = await AsyncStorage.getItem('authToken');
        }
      } catch (error) {
        console.error('Failed to get auth token for Pusher:', error);
        // Fallback: try to get from API service
        try {
          const apiService = (await import('./api')).default;
          authToken = await apiService.getCurrentToken();
        } catch (apiError) {
          console.error('Failed to get token from API service:', apiError);
        }
      }

      this.pusher = new Pusher(PUSHER_CONFIG.KEY, {
        cluster: PUSHER_CONFIG.CLUSTER,
        forceTLS: PUSHER_CONFIG.FORCE_TLS,
        authEndpoint: 'http://asaancar.test/broadcasting/auth',
        authTransport: 'ajax',
        auth: {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : '',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          params: {},
        },
      });

      // Handle connection events

      // Handle connection events
      this.pusher.connection.bind('connected', () => {
        // Connected successfully
      });

      this.pusher.connection.bind('error', (error: any) => {
        console.error('Pusher connection error:', error);
      });

      this.pusher.connection.bind('disconnected', () => {
        // Disconnected
      });
    } catch (error) {
      console.error('Failed to initialize Pusher:', error);
    }
  }

  // Subscribe to a chat channel
  subscribeToChat(conversationId: string, userId: string) {
    try {
      if (!this.pusher) {
        console.error('Pusher not initialized');
        return;
      }

      const channelName = `private-conversation.${conversationId}`;


      const channel = this.pusher.subscribe(channelName);
      this.channels.set(conversationId, channel);

      // Bind to events
      channel.bind('message-sent', (data: any) => {

        const callback = this.messageCallbacks.get(conversationId);
        if (callback) {
          callback(data);
        }
      });

      channel.bind('message-received', (data: any) => {

        const callback = this.messageCallbacks.get(conversationId);
        if (callback) {
          callback(data);
        }
      });

      channel.bind('typing', (data: any) => {

        const callback = this.typingCallbacks.get(conversationId);
        if (callback) {
          callback(true, data.user_id || 'unknown');
        }
      });

      channel.bind('stop-typing', (data: any) => {

        const callback = this.typingCallbacks.get(conversationId);
        if (callback) {
          callback(false, data.user_id || 'unknown');
        }
      });


    } catch (error) {
      console.error('Failed to subscribe to chat channel:', error);
    }
  }

  // Unsubscribe from a chat channel
  unsubscribeFromChat(conversationId: string) {
    try {
      const channelName = `private-conversation.${conversationId}`;

      
      const channel = this.channels.get(conversationId);
      if (channel) {
        this.pusher?.unsubscribe(channelName);
        this.channels.delete(conversationId);

      }
    } catch (error) {
      console.error('Failed to unsubscribe from chat channel:', error);
    }
  }

  // Send a message through Pusher
  sendMessage(conversationId: string, messageData: any) {
    try {
      const channelName = `private-conversation.${conversationId}`;

      
      const channel = this.channels.get(conversationId);
      if (channel) {
        channel.trigger('message-sent', messageData);

      } else {
        console.error('Channel not found for conversation:', conversationId);
      }
    } catch (error) {
      console.error('Failed to send message via Pusher:', error);
    }
  }

  // Trigger typing event
  triggerTyping(conversationId: string, isTyping: boolean, userId: string) {
    try {
      const channelName = `private-conversation.${conversationId}`;

      
      const channel = this.channels.get(conversationId);
      if (channel) {
        const eventName = isTyping ? 'typing' : 'stop-typing';
        channel.trigger(eventName, { user_id: userId });

      } else {
        console.error('Channel not found for conversation:', conversationId);
      }
    } catch (error) {
      console.error('Failed to trigger typing via Pusher:', error);
    }
  }

  // Handle received messages
  private handleMessageReceived(conversationId: string, data: any) {
    const callback = this.messageCallbacks.get(conversationId);
    if (callback) {
      callback(data);
    }
  }

  // Handle typing events
  private handleTypingEvent(conversationId: string, data: any, isTyping: boolean) {
    const callback = this.typingCallbacks.get(conversationId);
    if (callback) {
      callback(isTyping, data.userId);
    }
  }

  // Register message callback
  onMessage(conversationId: string, callback: (message: any) => void) {
    this.messageCallbacks.set(conversationId, callback);
  }

  // Register typing callback
  onTyping(conversationId: string, callback: (isTyping: boolean, userId: string) => void) {
    this.typingCallbacks.set(conversationId, callback);
  }

  // Remove callbacks
  removeCallbacks(conversationId: string) {
    this.messageCallbacks.delete(conversationId);
    this.typingCallbacks.delete(conversationId);
  }

  // Disconnect Pusher
  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
      this.channels.clear();
      this.messageCallbacks.clear();
      this.typingCallbacks.clear();
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.pusher?.connection.state === 'connected';
  }

  // Reinitialize Pusher with new auth token (call this after login)
  async reinitializeWithAuth() {
    try {
      if (this.pusher) {
        this.pusher.disconnect();
      }
      await this.initializePusher();
    } catch (error) {
      console.error('Failed to reinitialize Pusher with auth:', error);
    }
  }

  // Update auth token and reinitialize (call this after login)
  async updateAuthToken(newToken: string) {
    try {

      
      // Disconnect current connection
      if (this.pusher) {
        this.pusher.disconnect();
      }
      
      // Reinitialize with new token
      this.pusher = new Pusher(PUSHER_CONFIG.KEY, {
        cluster: PUSHER_CONFIG.CLUSTER,
        forceTLS: PUSHER_CONFIG.FORCE_TLS,
        authEndpoint: 'http://asaancar.test/broadcasting/auth',
        authTransport: 'ajax',
        auth: {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          params: {},
        },
      });


      
      // Handle connection events
      this.pusher.connection.bind('connected', () => {
        // Connected successfully with new token
      });

      this.pusher.connection.bind('error', (error: any) => {
        console.error('Pusher connection error:', error);
      });

      this.pusher.connection.bind('disconnected', () => {
        // Disconnected
      });
    } catch (error) {
      console.error('Failed to update Pusher auth token:', error);
    }
  }
}

export default new PusherService();