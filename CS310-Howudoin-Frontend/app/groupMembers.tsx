import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, FlatList, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Friend {
  id: string;
  name: string;
  lastName: string;
}

const GroupMembersPage = () => {
  const { groupId, token, friends, userId } = useLocalSearchParams();
  const [groupName, setGroupName] = useState<string>('');
  const [creationTime, setCreationTime] = useState<string>('');
  const [members, setMembers] = useState<string[]>([]);
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const router = useRouter();

  useEffect(() => {

    let parsedFriends: Friend[] = [];
    try {
      if (friends) {
        parsedFriends = JSON.parse(friends as string);
      }
    } catch (error) {
      console.error('Error parsing friends data:', error);
    }
    setFriendsList(parsedFriends);

    const fetchGroupDetails = async () => {
      try {
        const apiUrl = Platform.OS === 'android'
          ? `http://10.0.2.2:8080/groups/${groupId}/members`  
          : `http://localhost:8080/groups/${groupId}/members`; 

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGroupName(data.groupName);
          setCreationTime(data.creationTime);

          const updatedMembers = data.members.map((memberId: string) => {
            const friend = parsedFriends.find(
              (friend: Friend) => friend.id === memberId
            );
            const memberName = friend ? `${friend.name} ${friend.lastName}` : memberId;
            return memberId === userId ? "Me" : memberName;
          });
          setMembers(updatedMembers);
        } else {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'Failed to fetch group members.');
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        Alert.alert('Error', 'Failed to fetch group members.');
      }
    };

    fetchGroupDetails();
  }, [groupId, token, friends, userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{groupName}</Text>
      <Text style={styles.creationTime}>Created on: {creationTime}</Text>

      {members.length === 0 ? (
        <Text style={styles.noMembersText}>No members found.</Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              <Text style={styles.memberText}>{item}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  creationTime: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  noMembersText: {
    fontSize: 18,
    color: '#888',
    marginVertical: 20,
  },
  memberItem: {
    backgroundColor: '#eaeaea',
    padding: 10,
    marginVertical: 5,
    width: '80%',
    borderRadius: 5,
    marginHorizontal: Platform.OS === 'android' ? 10 : 0, 
  },
  memberText: {
    fontSize: 16,
  },
});

export default GroupMembersPage;