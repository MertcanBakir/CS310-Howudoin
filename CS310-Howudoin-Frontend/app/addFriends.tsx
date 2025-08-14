import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AddFriendsScreen() {
  const [receiverId, setReceiverId] = useState('');
  const { userId, token } = useLocalSearchParams(); 
  const router = useRouter();

  
  const addFriendApiUrl =
    Platform.OS === 'android' ? 'http://10.0.2.2:8080/friends/add' : 'http://localhost:8080/friends/add';

  
  const handleAddFriend = async () => {
    if (!userId || !receiverId || !token) {
      Alert.alert('Error', 'Sender ID, Receiver ID, and token are required.');
      return;
    }

    try {
      const response = await fetch(addFriendApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senderId: userId, receiverId }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'An error occurred.');
        return;
      }

      Alert.alert('Success', data.message || 'Friend request sent successfully!');
      setReceiverId(''); 
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while connecting to the server.');
    }
  };

  return (
    <View style={styles.container}>
     
      <Text style={styles.title}>Add Friend</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter ID"
        value={receiverId}
        onChangeText={setReceiverId}
      />
      <Button title="Send Friend Request" onPress={handleAddFriend} />
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