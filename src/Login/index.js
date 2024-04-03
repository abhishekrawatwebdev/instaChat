import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from "react-native";
import { auth, firestore } from '../../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import backLogin from '../assets/backLogin.webp'
import { useDispatch } from 'react-redux';
import { setUserData } from '../store/userSlice';
import { showMessage, hideMessage } from "react-native-flash-message";


const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const saveUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    auth.signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const uid = userCredential.user.uid;
        const userDoc = await firestore.collection('users').doc(uid).get();
        const userData = {
          email: userDoc.data().email,
          name: userDoc.data().name,
          gender: userDoc.data().gender || '',
          uid: uid,
          contacts: userDoc.data().contacts || [],
          profileImg: userDoc.data().profileImg || ''
        };
        saveUserData(userData)
          .then(() => {
            dispatch(setUserData(userData));
            showMessage({
              message: `Welcome Back ${userData.name}`,
              type: "success",
              backgroundColor: "white",
              color: 'orange'
            });
            navigation.navigate('Chats');
          })
          .catch(() => {
            showMessage({
              message: "Failed to store User's Data",
              type: "error",
              backgroundColor: "white",
              color: '#FF7F7F'
            });
          });
      })
      .catch((error) => {
        if(error.message.includes('invalid-credential')){
          showMessage({
            message: 'Invalid Email or password',
            type: "error",
            backgroundColor: "white",
            color: '#FF7F7F'
          });
        }
        if(error.message.includes('too-many-requests')){
          showMessage({
            message: 'Try again after some time',
            description: 'Access to this account has been temporarily disabled due to many failed login attempts.',
            type: "error",
            backgroundColor: "white",
            color: '#FF7F7F'
          });
        }
      });
    setIsLoading(false);

  };

  return (
    <View style={styles.container}>
        {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f57c00" />
        </View>
      )}
    <Image source={backLogin} style={styles.backImage} />
    <View style={styles.whiteSheet} />
    <SafeAreaView style={styles.form}>
      <Text style={styles.title}>Log In</Text>
       <TextInput
      style={styles.input}
      placeholder="Enter email"
      autoCapitalize="none"
      keyboardType="email-address"
      textContentType="emailAddress"
      autoFocus={true}
      value={email}
      onChangeText={(text) => setEmail(text)}
    />
    <TextInput
      style={styles.input}
      placeholder="Enter password"
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry={true}
      textContentType="password"
      value={password}
      onChangeText={(text) => setPassword(text)}
    />
    <TouchableOpacity style={styles.button} onPress={handleLogin}>
      <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}> Log In</Text>
    </TouchableOpacity>
    <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
      <Text style={{color: 'gray', fontWeight: '600', fontSize: 14}}>Don't have an account? </Text>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={{color: '#f57c00', fontWeight: '600', fontSize: 14}}> Sign Up</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
    <StatusBar barStyle="light-content" />
  </View>
);
}
const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#fff",
},
title: {
  fontSize: 36,
  fontWeight: 'bold',
  color: "black",
  alignSelf: "center",
  paddingBottom: 24,
},
input: {
  backgroundColor: "#F6F7FB",
  height: 58,
  marginBottom: 20,
  fontSize: 16,
  borderRadius: 10,
  padding: 12,
},
loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
backImage: {
  width: "100%",
  height: 340,
  position: "absolute",
  top: 0,
  resizeMode: 'cover',
},
whiteSheet: {
  width: '100%',
  height: '75%',
  position: "absolute",
  bottom: 0,
  backgroundColor: '#fff',
  borderTopLeftRadius: 60,
},
form: {
  flex: 1,
  justifyContent: 'center',
  marginHorizontal: 30,
},
button: {
  backgroundColor: '#f57c00',
  height: 58,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 40,
},
});

export default Login;