import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

type Friend = {
  id: string;
  name: string;
  lastName: string;
};

const AddToGroupPage = () => {
  const { userId, token, groupId, friends } = useLocalSearchParams();

  const [adderId, setAdderId] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);

 
  let friendsList: Friend[] = [];

  try {
    if (typeof friends === 'string') {
     
      const friendsArray: string[] = JSON.parse(friends);
      friendsList = friendsArray.map((friendId) => ({
        id: friendId,
        name: '', 
        lastName: '', 
      }));
    }
  } catch (error) {
    console.error('Error parsing friends data:', error);
    Alert.alert('Error', 'Failed to parse the friends list.');
    return;
  }


  const handleAddMember = () => {
    if (!adderId) {
      Alert.alert('Error', 'Please enter the adder ID.');
      return;
    }

  
    if (userId === adderId) {
      Alert.alert('Error', 'You cannot add yourself to the group.');
      return;
    }

    setIsLoading(true);


    const apiUrl = Platform.OS === 'android'
      ? `http://10.0.2.2:8080/groups/${groupId}/add-member`  
      : `http://localhost:8080/groups/${groupId}/add-member`;

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senderId: adderId, 
        memberId: userId,   
      }),
    })
      .then((response) => response.text()) 
      .then((data) => {
        if (data === 'Person added to the group successfully.') {
          Alert.alert('Success', 'Person added to the group successfully.');
        } else {
          Alert.alert('Error', data || 'Failed to add member to the group.');
        }
      })
      .catch((error) => {
        console.error('Error adding member:', error);
        Alert.alert('Error', 'An error occurred while adding the member. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Member to the Group</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter ID"
        value={adderId}
        onChangeText={setAdderId}
        autoCapitalize="none"
      />

      <Button
        title={isLoading ? 'Adding...' : 'Add Member'}
        onPress={handleAddMember}
        disabled={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Platform.OS === 'android' ? 20 : 15,  
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Platform.OS === 'ios' ? 25 : 15,  
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: '80%',
    fontSize: 16,  
  },
});

export default AddToGroupPage;