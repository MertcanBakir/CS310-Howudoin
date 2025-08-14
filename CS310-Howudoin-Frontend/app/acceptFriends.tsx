import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AcceptFriendsScreen() {
  const { userId, token } = useLocalSearchParams();
  const [senderId, setSenderId] = useState('');
  const router = useRouter();

  
  const acceptFriendApiUrl =
    Platform.OS === 'android' ? 'http://10.0.2.2:8080/friends/accept' : 'http://localhost:8080/friends/accept';

  
  const handleAcceptFriend = () => {
    if (!userId || !senderId || !token) {
      Alert.alert('Error', 'Both Sender ID and token are required.');
      return;
    }

    fetch(acceptFriendApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senderId, 
        receiverId: userId, 
      }),
    })
      .then(async (response) => {
        const contentType = response.headers.get('Content-Type');

        
        let responseMessage;
        if (contentType && contentType.includes('application/json')) {
          const responseData = await response.json();
          responseMessage = responseData.message || 'Unknown error occurred.';
        } else {
          responseMessage = await response.text();
        }

        if (response.ok) {
          Alert.alert('Success', responseMessage, [
            {
              text: 'OK',
              onPress: () =>
                router.push({
                  pathname: '/friendList',
                  params: { userId, token }, 
                }),
            },
          ]);
        } else {
          Alert.alert('Error', responseMessage);
        }

        setSenderId(''); 
      })
      .catch((error) => {
        console.error('Fetch Error:', error);
        Alert.alert('Error', `An error occurred: ${error.message}`);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accept Friend Request</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter ID"
        value={senderId}
        onChangeText={setSenderId}
      />
      <Button
        title="Accept Friend Request"
        onPress={handleAcceptFriend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});