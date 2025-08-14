import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

type Message = {
  content: string;
  groupId: string;
  timestamp: string;
  senderId: string;
};

type Friend = {
  id: string;
  name: string;
  lastName: string;
};

const formatTimestamp = (timestamp: string): string => {
  const regex = /^([A-Za-z]+ [A-Za-z]+ \d{1,2} \d{2}:\d{2}:\d{2}) [A-Za-z]+ \d{4}$/;
  const match = timestamp.match(regex);

  if (!match) {
    console.error("Invalid timestamp format:", timestamp);
    return 'Invalid Time';
  }

  const timePart = match[1].split(" ")[3]; 
  const [hours, minutes] = timePart.split(":");

  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

export default function GroupChat() {
  const params = useLocalSearchParams();
  const senderId = params.userId as string; 
  const token = params.token as string;
  const groupId = params.groupId as string;
  const friends = params.friends as string; 
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [friendsList, setFriendsList] = useState<Friend[]>([]);

  const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

  useEffect(() => {
    if (friends) {
      try {
        setFriendsList(JSON.parse(friends));
      } catch (error) {
        console.log('Error parsing friends data:', error);
      }
    }
  }, [friends]);

  const handleGetMessages = () => {
    const url = `${apiUrl}/groups/${groupId}/messages`;

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        Alert.alert('Error', 'Failed to fetch messages');
        setLoading(false);
      });
  };

  const handleSendMessage = () => {
    if (!senderId || !groupId || !token || !content) {
      Alert.alert('Error', 'Sender ID, Group ID, content, and token are required.');
      return;
    }

    const messageData = {
      senderId: senderId,
      content: content,
    };

    fetch(`${apiUrl}/groups/${groupId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Message sent!') {
          setContent('');
          const newMessage: Message = {
            content: data.content,
            groupId: data.groupId,
            timestamp: data.timestamp,
            senderId: senderId,
          };
          setMessages((prevMessages) => [...prevMessages, newMessage]);
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
    handleGetMessages();
  }, [groupId]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <View style={styles.messageList}>
            {loading ? (
              <Text style={styles.text}>Loading messages...</Text>
            ) : messages.length > 0 ? (
              messages.map((item, index) => {
                const isSender = item.senderId === senderId;
                const sender = isSender
                  ? 'Me'
                  : friendsList.find(friend => friend.id === item.senderId);
                const senderName =
                  sender === 'Me'
                    ? 'Me'
                    : sender
                    ? `${sender.name} ${sender.lastName}`
                    : item.senderId;

                return (
                  <View
                    key={index}
                    style={[styles.messageContainer, isSender ? styles.senderMessage : styles.receiverMessage]}
                  >
                    <Text style={styles.messageSender}>{senderName}</Text>
                    <Text style={styles.messageContent}>{item.content}</Text>
                    <Text style={styles.messageTimestamp}>{formatTimestamp(item.timestamp)}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.text}>No messages found.</Text>
            )}
          </View>
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
    justifyContent: 'space-between', 
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  messageList: {
    flex: 1, 
    marginBottom: 10,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    maxWidth: '70%',
  },
  senderMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1f7c4',
  },
  receiverMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6e6e6',
  },
  messageSender: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
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
    justifyContent: 'flex-end', 
    marginBottom: 10,
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