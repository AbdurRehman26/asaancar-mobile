import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import apiService from '../../services/api';
import pusherService from '../../services/pusher';
import { AuthContext } from '../_layout';

interface Message {
  id: number;
  conversation_id: number;
  sender_type: 'user' | 'store';
  sender_id: number; // Add sender_id field
  message: string;
  created_at: string;
}

interface Conversation {
  id: number;
  store_id: number;
  store?: {
    id: number;
    name: string;
  };
  store_name?: string; // Fallback for direct store_name
  last_message?: {
    id: number;
    message: string;
    sender_id: number;
    sender_type: 'user' | 'store';
    created_at: string;
  } | string; // Can be object or string for backward compatibility
  last_message_time?: string;
  last_message_sender_id?: number;
  last_message_sender_type?: 'user' | 'store';
  unread_count?: number;
}

export default function ChatScreen() {
  const { isLoggedIn } = useContext(AuthContext);
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { storeId, storeName } = params;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Get current user ID
  const getCurrentUserId = async () => {
    try {
      // This should come from your auth context or API
      // For now, using a placeholder - replace with actual user ID retrieval
      const userId = 1; // Replace with actual user ID from auth
      setCurrentUserId(userId);
      return userId;
    } catch (error) {
      console.error('Failed to get current user ID:', error);
      return null;
    }
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getConversations();

      setConversations(response || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Use mock data as fallback
      setConversations([
        {
          id: 1,
          store_id: 1,
          store_name: 'Car Rental Store',
          last_message: 'Hello! How can I help you?',
          last_message_time: '2024-01-15T10:00:00Z',
          last_message_sender_id: 999, // Store ID
          last_message_sender_type: 'store',
          unread_count: 0,
        },
        {
          id: 2,
          store_id: 2,
          store_name: 'Premium Car Rentals',
          last_message: 'I have a question about my booking',
          last_message_time: '2024-01-15T09:30:00Z',
          last_message_sender_id: 1, // User ID
          last_message_sender_type: 'user',
          unread_count: 2,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: number) => {
    try {
      setLoading(true);
      const response = await apiService.getMessages(conversationId);
      setMessages(response || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Use mock data as fallback
      setMessages([
        {
          id: 1,
          conversation_id: conversationId,
          sender_type: 'store',
          sender_id: 999, // Store ID
          message: 'Hello! How can I help you with your booking?',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          conversation_id: conversationId,
          sender_type: 'user',
          sender_id: 1, // Current user ID
          message: 'I have a question about my car rental',
          created_at: '2024-01-15T10:05:00Z',
        },
        {
          id: 3,
          conversation_id: conversationId,
          sender_type: 'store',
          sender_id: 999, // Store ID
          message: 'Sure! What would you like to know?',
          created_at: '2024-01-15T10:10:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // Get current user ID if not already set
      const userId = currentUserId || await getCurrentUserId();
      
      // Optimistically add message to UI
      const tempMessage: Message = {
        id: Date.now(),
        conversation_id: selectedConversation.id,
        sender_type: 'user', // Ensure this is set to 'user'
        sender_id: userId || 1, // Use current user ID
        message: messageText,
        created_at: new Date().toISOString(),
      };

  

      setMessages(prev => [...prev, tempMessage]);

      // Send message via API
      const response = await apiService.sendMessage(selectedConversation.id, messageText);
      
      // Update message with server response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, id: response.id, created_at: response.created_at }
            : msg
        )
      );

      // Send via Pusher for real-time
      pusherService.sendMessage(selectedConversation.id.toString(), {
        ...response,
        conversation_id: selectedConversation.id,
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== Date.now()));
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // Handle incoming messages from Pusher
  const handleIncomingMessage = (message: Message) => {
    if (message.conversation_id === selectedConversation?.id) {
      setMessages(prev => [...prev, message]);
    }
  };

  // Handle typing events from Pusher
  const handleTypingEvent = (isTyping: boolean, userId: string) => {
    if (isTyping) {
      setTypingUsers(prev => [...prev, userId]);
    } else {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Auto-create conversation if storeId is provided
  useEffect(() => {
    if (storeId && storeName && !selectedConversation) {
      
      
      const createAndJoinConversation = async () => {
        try {
          setCreatingConversation(true);
          
          // Check if user is logged in
          if (!isLoggedIn) {
    
            Alert.alert('Error', 'Please log in to start a conversation');
            return;
          }
          
          const conversation = await apiService.createConversation(Number(storeId));
          
  
          
          // Check if the API call was successful (status 200 or success response)
          if (conversation && conversation.id) {
            const newConversation: Conversation = {
              id: conversation.id,
              store_id: Number(storeId),
              store_name: storeName as string,
              last_message: '',
              last_message_time: conversation.created_at,
              unread_count: 0,
            };
            
    
            setConversations(prev => [newConversation, ...prev]);
            setSelectedConversation(newConversation);
            loadMessages(conversation.id);
          } else {
            // If API call failed, show error or fallback
            console.error('Failed to create conversation - no valid response');
            // Create a fallback conversation so user can still chat
            const fallbackConversation: Conversation = {
              id: Date.now(),
              store_id: Number(storeId),
              store_name: storeName as string,
              last_message: '',
              last_message_time: new Date().toISOString(),
              unread_count: 0,
            };
            
    
            setConversations(prev => [fallbackConversation, ...prev]);
            setSelectedConversation(fallbackConversation);
            // Don't call loadMessages since API failed
          }
        } catch (error) {
          console.error('Failed to create conversation:', error);
          Alert.alert('Error', 'Failed to start conversation. Please try again.');
        } finally {
          setCreatingConversation(false);
        }
      };

      createAndJoinConversation();
    }
  }, [storeId, storeName]);

  // Subscribe to Pusher when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // Subscribe to chat channel
      pusherService.subscribeToChat(selectedConversation.id.toString(), 'user-1');
      
      // Register callbacks
      pusherService.onMessage(selectedConversation.id.toString(), handleIncomingMessage);
      pusherService.onTyping(selectedConversation.id.toString(), handleTypingEvent);

      // Load messages
      loadMessages(selectedConversation.id);

      // Cleanup on unmount
      return () => {
        pusherService.unsubscribeFromChat(selectedConversation.id.toString());
        pusherService.removeCallbacks(selectedConversation.id.toString());
      };
    }
  }, [selectedConversation]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Get current user ID on mount
  useEffect(() => {
    getCurrentUserId();
  }, []);

  // Hide/show tab bar based on conversation selection
  useEffect(() => {
    if (selectedConversation) {
      // Hide tab bar when in a conversation
      navigation.setOptions({
        tabBarStyle: { display: 'none' }
      });
    } else {
      // Show tab bar when viewing conversation list
      navigation.setOptions({
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }
      });
    }
  }, [selectedConversation, navigation]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    if (selectedConversation) {
      await loadMessages(selectedConversation.id);
    }
    setRefreshing(false);
  };

  // Check if user is logged in - now after all hooks
  if (!isLoggedIn) {
    return null;
  }



  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((total, conversation) => {
    return total + (conversation.unread_count || 0);
  }, 0);

  // Get the most recent conversation time
  const getLastMessageTime = () => {
    if (conversations.length === 0) return '';
    
    const mostRecentConversation = conversations.reduce((latest, current) => {
      const currentTime = current.last_message_time ? new Date(current.last_message_time) : new Date(0);
      const latestTime = latest.last_message_time ? new Date(latest.last_message_time) : new Date(0);
      return currentTime > latestTime ? current : latest;
    });
    
    if (mostRecentConversation.last_message_time) {
      return new Date(mostRecentConversation.last_message_time).toLocaleDateString();
    }
    return '';
  };

  // Render message item
  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = currentUserId && item.sender_id === currentUserId;
    const messageTime = new Date(item.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Ensure message is a string
    const messageText = typeof item.message === 'string' ? item.message : JSON.stringify(item.message);



    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.userMessage : styles.storeMessage]}>
        <View style={[styles.messageBubble, isCurrentUser ? styles.userBubble : styles.storeBubble]}>
          <Text style={[styles.messageText, isCurrentUser ? styles.userMessageText : styles.storeMessageText]}>
            {messageText}
          </Text>
          <Text style={[styles.messageTime, isCurrentUser ? styles.userMessageTime : styles.storeMessageTime]}>
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  // Render conversation item
  const renderConversation = ({ item }: { item: Conversation }) => {
    const isSelected = selectedConversation?.id === item.id;
    const lastMessageTime = item.last_message_time 
      ? new Date(item.last_message_time).toLocaleDateString()
      : '';

    // Extract message text and sender info from last_message object
    let lastMessageText = '';
    let lastMessageSenderId: number | undefined;
    let lastMessageSenderType: 'user' | 'store' | undefined;

    if (typeof item.last_message === 'string') {
      // Backward compatibility for string last_message
      lastMessageText = item.last_message;
      lastMessageSenderId = item.last_message_sender_id;
      lastMessageSenderType = item.last_message_sender_type;
    } else if (item.last_message && typeof item.last_message === 'object') {
      // Extract from last_message object
      lastMessageText = item.last_message.message || '';
      lastMessageSenderId = item.last_message.sender_id;
      lastMessageSenderType = item.last_message.sender_type;
    }

    // Extract store name from store object or fallback to store_name
    const storeName = item.store?.name || item.store_name || 'Unknown Store';

    // Determine who sent the last message
    const isLastMessageFromCurrentUser = currentUserId && lastMessageSenderId === currentUserId;
    const lastMessageSender = isLastMessageFromCurrentUser ? 'You' : storeName;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, isSelected && styles.selectedConversation]}
        onPress={() => setSelectedConversation(item)}
      >
        <View style={styles.conversationContent}>
          <Text style={styles.conversationTitle}>{storeName}</Text>
          {lastMessageText && (
            <View style={styles.lastMessageContainer}>
              <Text style={styles.lastMessageSender}>
                {lastMessageSender}:
              </Text>
              <Text style={styles.conversationLastMessage} numberOfLines={1}>
                {lastMessageText}
              </Text>
            </View>
          )}
          {lastMessageTime && (
            <Text style={styles.conversationTime}>{lastMessageTime}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {selectedConversation ? `Chat with ${selectedConversation.store?.name || selectedConversation.store_name || 'Store'}` : 'Chat'}
        </Text>
        {!selectedConversation && getLastMessageTime() && (
          <Text style={styles.headerLastMessageTime}>
            {getLastMessageTime()}
          </Text>
        )}
        {selectedConversation && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedConversation(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>

      {!selectedConversation ? (
        // Conversations List
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => `conversation-${item.id}-${item.store_id}`}
          style={styles.conversationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            creatingConversation ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#7e246c" />
                <Text style={styles.emptyText}>Creating conversation...</Text>
              </View>
            ) : loading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#7e246c" />
                <Text style={styles.emptyText}>Loading conversations...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No conversations yet</Text>
                <Text style={styles.emptySubtext}>Start a chat with a store</Text>
              </View>
            )
          }
        />
      ) : (
        // Chat Interface - Always show when conversation is selected
        <KeyboardAvoidingView 
          style={styles.chatContainer} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Messages */}
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => `message-${item.id}-${item.conversation_id}`}
            style={styles.messagesList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.emptyContainer}>
                  <ActivityIndicator size="large" color="#7e246c" />
                  <Text style={styles.emptyText}>Loading messages...</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Start the conversation</Text>
                  <Text style={styles.emptySubtext}>Type a message below to begin chatting</Text>
                </View>
              )
            }
          />

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>
                {typingUsers.join(', ')} is typing...
              </Text>
            </View>
          )}

          {/* Message Input - Always visible when conversation is selected */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  backButtonText: {
    color: '#7e246c',
    fontWeight: '600',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginPromptText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#7e246c',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedConversation: {
    backgroundColor: '#f8f0fa',
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7e246c',
    marginRight: 5,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  storeMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#7e246c',
    borderBottomRightRadius: 4,
  },
  storeBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  storeMessageText: {
    color: '#222',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  storeMessageTime: {
    color: '#999',
  },
  typingContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#7e246c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  headerLastMessageTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
}); 