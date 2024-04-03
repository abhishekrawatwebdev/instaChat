import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { auth, firestore } from '../../firebase';
import backLogin from '../assets/backLogin.webp';
import { Picker } from '@react-native-picker/picker';
import { useDispatch } from 'react-redux';
import { setUserData } from '../store/userSlice'; // Import the action
import { showMessage } from 'react-native-flash-message';

const Signup = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState(''); // State for gender
  const [isLoading, setIsLoading] = useState(false); // State for loading
  const dispatch = useDispatch(); // Get the dispatch function

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      const userId = user.uid;
      
      // Store additional user data in Firestore
      await firestore.collection('users').doc(userId).set({
        name: name,
        email: email,
        gender: gender,
        contacts: [],
        profileImg: ''
      });

      // Dispatch action to update user data in Redux store
      dispatch(setUserData({
        uid: userId,
        email: email,
        name: name,
        gender: gender,
        contacts: [],
        profileImg: ''
      }));

      console.log('User added to Firestore successfully!');
      navigation.navigate('Chats');
    } catch (error) {
      if(error.message.includes('email-already-in-use')){
        showMessage({
          message: `Email Already registered`,
          type: "error",
          backgroundColor: "white",
          color: 'red'
        });
      }
      else if(error.message.includes('weak-password')){
        showMessage({
          message: error.message,
          type: "error",
          backgroundColor: "white",
          color: 'red'
        });
      }else{
        showMessage({
          message: error.message,
          type: "error",
          backgroundColor: "white",
          color: 'red'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Image source={backLogin} style={styles.backImage} />
      <View style={styles.whiteSheet} />
      <View style={styles.form}>
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
          placeholder="Enter Name"
          autoCapitalize="none"
          keyboardType="name-phone-pad"
          textContentType="name"
          value={name}
          onChangeText={(text) => setName(text)}
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
        {/* Gender Dropdown */}
        <Picker
          selectedValue={gender}
          style={styles.input}
          onValueChange={(itemValue, itemIndex) => setGender(itemValue)}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Picker>

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}> Sign Up</Text>
        </TouchableOpacity>
        <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
          <Text style={{color: 'gray', fontWeight: '600', fontSize: 14}}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{color: '#f57c00', fontWeight: '600', fontSize: 14}}> Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f57c00" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  input: {
    backgroundColor: '#F6F7FB',
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "black",
    alignSelf: "center",
    paddingBottom: 24,
  },
  button: {
    backgroundColor: '#f57c00',
    height: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  backImage: {
    width: '100%',
    height: 340,
    position: 'absolute',
    top: 0,
    resizeMode: 'cover',
  },
  whiteSheet: {
    width: '100%',
    height: '75%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default Signup;
