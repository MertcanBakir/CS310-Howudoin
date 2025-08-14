import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Friend {
  id: string;
  name: string;
  lastName: string;
}

const GroupPage = () => {
  const { userId, token, friends, groups } = useLocalSearchParams();
  const router = useRouter();

  let friendsList: Friend[] = [];
  try {
    if (friends) {
      friendsList = JSON.parse(friends as string);
    }
  } catch (error) {
    Alert.alert('Error', 'Invalid friends data format.');
    console.log('Error parsing friends data:', error);
  }

  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<{ name: string; lastName: string }[]>([
    { name: '', lastName: '' },
  ]);
  const [groupsList, setGroupsList] = useState<string[]>(() => {
    try {
      return groups ? JSON.parse(groups as string) : [];
    } catch {
      return [];
    }
  });

  const handleAddMember = () => {
    setMembers([...members, { name: '', lastName: '' }]);
  };

  const handleCreateGroup = async () => {
    if (!groupName) {
      Alert.alert('Error', 'Please provide a group name.');
      return;
    }

    const updatedMembers = [
      { name: '', lastName: '', id: userId },
      ...members.map((member) => {
        const matchingFriend = friendsList.find(
          (friend) =>
            member.name.toLowerCase() === friend.name.toLowerCase() &&
            member.lastName.toLowerCase() === friend.lastName.toLowerCase()
        );
        return {
          name: member.name,
          lastName: member.lastName,
          id: matchingFriend ? matchingFriend.id : '',
        };
      }),
    ];

    const invalidMembers = updatedMembers.filter((member) => member.id === '');
    if (invalidMembers.length > 0) {
      Alert.alert('Error', 'Some members are not in your friend list.');
      return;
    }

    const groupData = {
      name: groupName,
      members: updatedMembers.map((member) => member.id),
    };

    try {
      const apiUrl = Platform.OS === 'android'
        ? 'http://10.0.2.2:8080/groups/create' 
        : 'http://localhost:8080/groups/create'; 

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(groupData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response Data:', data);

        setGroupsList((prevGroups) => [...prevGroups, data.groupId]);

        Alert.alert('Success', 'Group created successfully!');
      } else {
        const errorData = await response.json();
        console.log('API Error Data:', errorData);
        Alert.alert(
          'Error',
          errorData.message || 'Failed to create the group. Please try again.'
        );
      }
    } catch (error) {
      console.log('Fetch Error:', error);
      Alert.alert('Error', 'Failed to create the group. Please try again later.');
    }
  };

  const handleNavigateToGroupChat = (groupId: string) => {
    router.push({
      pathname: '/groupChat',
      params: {
        userId,
        groupId,
        token,
        friends
      },
    });
  };

  const handleNavigateToAddToGroup = (groupId: string) => {
    router.push({
      pathname: '/addToGroup',
      params: {
        userId,
        groupId,
        token,
        friends,
        groups
      },
    });
  };

  const handleNavigateToGroupMembers = (groupId: string) => {
    router.push({
      pathname: '/groupMembers',
      params: {
        userId,
        groupId,
        token,
        friends
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Group</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Group Name"
        value={groupName}
        onChangeText={setGroupName}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Add Members:</Text>
      {members.map((member, index) => (
        <View key={index} style={styles.friendInputContainer}>
          <TextInput
            style={styles.friendInput}
            placeholder="Name"
            value={member.name}
            onChangeText={(text) =>
              setMembers((prevMembers) => {
                const updatedMembers = [...prevMembers];
                updatedMembers[index].name = text;
                return updatedMembers;
              })
            }
            autoCapitalize="none"
          />
          <TextInput
            style={styles.friendInput}
            placeholder="Last Name"
            value={member.lastName}
            onChangeText={(text) =>
              setMembers((prevMembers) => {
                const updatedMembers = [...prevMembers];
                updatedMembers[index].lastName = text;
                return updatedMembers;
              })
            }
            autoCapitalize="none"
          />
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Button title="Create Group" onPress={handleCreateGroup} />

      <Text style={styles.label}>Your Groups:</Text>
      <FlatList
        data={groupsList}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            <Text style={styles.groupText}>{item}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Chat" onPress={() => handleNavigateToGroupChat(item)} />
              <Button title="Add" onPress={() => handleNavigateToAddToGroup(item)} />
              <Button title="List" onPress={() => handleNavigateToGroupMembers(item)} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: '80%',
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
  },
  friendInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '80%',
  },
  friendInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '48%',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  groupItem: {
    backgroundColor: '#eaeaea',
    padding: 10,
    marginVertical: 5,
    width: '100%',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupText: {
    fontSize: 16,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
  },
});

export default GroupPage;