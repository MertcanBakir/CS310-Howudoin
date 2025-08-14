import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert, Platform } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8080/login' : 'http://localhost:8080/login';

  const handleLogin = () => {

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data && data.token) {
          Alert.alert('Login Successful');
          

          router.push({
            pathname: '/friendList',
            params: { 
              token: data.token, 
              userId: data.id,
              groups: data.groups || [], 
            },
          });
        } else {

          const errorMessage = data?.message || 'Invalid email or password';
          Alert.alert('Error', errorMessage);
        }
      })
      .catch((error) => {
        Alert.alert('Error', error.message || 'An error occurred while connecting to the server.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"  
        autoCorrect={false} 
        autoComplete="off"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none" 
        autoCorrect={false}  
        autoComplete="off" 
      />
      <Button title="Login" onPress={handleLogin} />
      <Link href="/RegisterScreen">Register</Link>
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