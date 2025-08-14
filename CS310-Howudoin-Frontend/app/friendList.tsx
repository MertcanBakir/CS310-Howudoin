import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, FlatList, Button, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Friend {
  id: string;
  name: string;
  lastName: string;
  email: string;
  friends: string[];
  pendingFriendRequests: string[];
}

export default function UserScreen() {
  const router = useRouter();
  const { token, userId, groups } = useLocalSearchParams();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8080/friends' : 'http://localhost:8080/friends';

  const handleFetchFriends = () => {
    if (!userId || !token) {
      Alert.alert('Error', 'User ID or token is missing.');
      return;
    }

    fetch(`${apiUrl}?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch friends');
        }
        return response.json();
      })
      .then((data: Friend[]) => {
        setFriends(data);
      })
      .catch((error) => {
        console.error('Error fetching friends:', error);
        Alert.alert('Error', 'An error occurred while fetching the friends.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    handleFetchFriends();
  }, [userId, token]);

  const handleChatNavigation = (receiverId: string, receiverName: string, receiverLastName: string) => {
    if (!userId || !token) {
      Alert.alert('Error', 'User ID or token is missing.');
      return;
    }

    router.push({
      pathname: '/chatWfriends',
      params: {
        userId,
        receiverId,
        token,
        receiverName,
        receiverLastName,
      },
    });
  };

  const handleAddFriendNavigation = () => {
    if (!userId || !token) {
      Alert.alert('Error', 'User ID or token is missing.');
      return;
    }

    router.push({
      pathname: '/addFriends',
      params: { userId, token },
    });
  };

  const handleAcceptFriendNavigation = () => {
    if (!userId || !token) {
      Alert.alert('Error', 'User ID or token is missing.');
      return;
    }

    router.push({
      pathname: '/acceptFriends',
      params: { userId, token },
    });
  };

  const handleGroupPage = () => {
    if (!userId || !token) {
      Alert.alert('Error', 'User ID or token is missing.');
      return;
    }

    const friendsData = friends.map(friend => ({
      id: friend.id,
      name: friend.name,
      lastName: friend.lastName,
    }));

    let groupsData: string[] = [];

    if (groups) {
      if (typeof groups === 'string') {
        groupsData = groups.split(',').map(group => group.trim());
      } else if (Array.isArray(groups)) {
        groupsData = groups.filter(item => typeof item === 'string');
      }
    }

    console.log('Groups being passed:', groupsData);

    router.push({
      pathname: '/groupPage',
      params: {
        userId,
        token,
        friends: JSON.stringify(friendsData),
        groups: JSON.stringify(groupsData),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.userIdText}>Your ID: {userId}</Text>

      <Text style={styles.title}>Friends List</Text>
      {friends.length > 0 ? (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.friendItem}>
              <Text style={styles.friendText}>
                {item.name} {item.lastName}
              </Text>
              <Button
                title="Chat"
                onPress={() => handleChatNavigation(item.id, item.name, item.lastName)}
              />
            </View>
          )}
        />
      ) : (
        <Text>No friends found.</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Groups" onPress={handleGroupPage} />
        <Button title="Add Friend" onPress={handleAddFriendNavigation} />
        <Button title="Accept Friend" onPress={handleAcceptFriendNavigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginTop: 50,
  },
  userIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#eaeaea',
    borderRadius: 5,
  },
  friendText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});