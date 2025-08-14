import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

// Mesaj türü
type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  groupId: string | null;
  content: string;
  timestamp: string; 
};


const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`; 
};

export default function ChatWfriends() {
  const { userId: senderId, receiverId, token, receiverName, receiverLastName } = useLocalSearchParams();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [content, setContent] = useState('');


  const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8080/messages' : 'http://localhost:8080/messages';

  const handleGetMessage = () => {
    console.log('Fetching messages from API...');
    fetch(`${apiUrl}?userId1=${senderId}&userId2=${receiverId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        return response.json();
      })
      .then((data: Message[]) => {
        console.log('Messages fetched:', data); 
        setMessages(data); 
        setLoading(false); 
      })
      .catch((error) => {
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while fetching the messages.');
        setLoading(false);
      });
  };


  const handleSendMessage = () => {
    if (!senderId || !receiverId || !token || !content) {
      Alert.alert('Error', 'Sender ID, Receiver ID, content, and token are required.');
      return;
    }

    const messageData = {
      senderId: senderId,
      receiverId: receiverId,
      content: content, 
    };

    console.log('Sending message data:', messageData); 

    fetch(`${apiUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify(messageData),
    })
      .then((response) => response.json())  
      .then((data) => {
        console.log('Response after sending message:', data);  
        if (!data || data.message === 'Unauthorized request') {
          Alert.alert('Error', 'Unauthorized request. Please check your token.');
          return;
        }

        if (data.message === 'Message sent!') {
          setContent(''); 
          handleGetMessage(); 
        } else {
          Alert.alert('Error', data.message || 'An error occurred.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while sending the message.');
      });
  };

  useEffect(() => {
    handleGetMessage();
  }, []);

  useEffect(() => {
    if (receiverName && receiverLastName) {
      navigation.setOptions({
        title: `${receiverName} ${receiverLastName}`, 
      });
    }
  }, [receiverName, receiverLastName, navigation]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          {loading ? (
            <Text style={styles.text}>Loading messages...</Text>
          ) : messages.length > 0 ? (
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageContainer,
                    item.senderId === senderId ? styles.outgoingMessage : styles.incomingMessage, 
                  ]}
                >
                  <Text style={styles.messageContent}>{item.content}</Text>
                  <Text style={styles.messageTimestamp}>
                    {formatTimestamp(item.timestamp)} 
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.text}>No messages found.</Text>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={content}
              onChangeText={setContent}
              autoCapitalize="none"  
              autoCorrect={false} 
              autoComplete="off" 
            />
            <Button title="Send" onPress={handleSendMessage} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  outgoingMessage: {
    backgroundColor: '#d1f7c4', 
    alignSelf: 'flex-end',
  },
  incomingMessage: {
    backgroundColor: '#e6e6e6',
    alignSelf: 'flex-start',
  },
  messageContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  messageTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});