
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert, Pressable, Platform } from 'react-native';


export default function RegisterScreen() {
    const [name, setname] = useState('');
    const [lastName, setlastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8080/register' : 'http://localhost:8080/register';


    const handleLogin = () => {
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          lastName: lastName,  
          email: email,
          password: password,
        }),
      })
        .then((response) => response.json()) 
        .then((data) => {
          if (data.message === 'User registered successfully!') {
            Alert.alert('Success', 'User registered successfully!');
          } else{
            Alert.alert('False', 'Email already registered.'); 
          } 
        })
        .catch((error) => {
          console.error('Error:', error);
          Alert.alert('Error', 'An error occurred while connecting to the server.');
        });
    };
    return(
        <View style={styles.container}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setname}
          autoCapitalize="none"  
          autoCorrect={false}   
          autoComplete="off" 
        />
         <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setlastName}
          autoCapitalize="none"  
          autoCorrect={false} 
          autoComplete="off" 
        />
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
        <Button title="Enter" onPress={handleLogin} />
        
  
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        marginTop: 100, 
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