import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          headerTitle: "Login Page", 
        }}
      />


      <Stack.Screen 
        name="friendList" 
        options={{
          headerTitle: "Friends List", 
        }}
      />

      <Stack.Screen 
        name="addFriends" 
        options={{
          headerTitle: "Add Friend", 
        }}
      />

  
      <Stack.Screen 
        name="acceptFriends" 
        options={{
          headerTitle: "Accept Friend Request", 
        }}
      />

      <Stack.Screen 
        name="groupPage" 
        options={{
        headerTitle: "Groups", 
          }}
        />
    </Stack>
  );
};

export default RootLayout;