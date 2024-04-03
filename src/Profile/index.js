import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'; // Import launchCamera
import { auth, firestore } from '../../firebase';
import storage from '@react-native-firebase/storage';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserData } from '../store/userSlice';
import user from '../assets/user.png';

const Profile = ({ navigation }) => {
  const userData = useSelector(state => state.user.userData);
  const [profileImage, setProfileImage] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleImageUpload = () => {
    let options ={
        storageOptions: {
            path: "image"
        }
    }
    launchImagePicker(options);
  };

  const launchImagePicker = (options) => {
    Alert.alert(
      'Select Image',
      'Choose the source of the image',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
            text: 'Camera',
            onPress: () => launchCamera(options, response => handleImageResponse(response)),
        },
        {
            text: 'Gallery',
            onPress: () => launchImageLibrary(options, response => handleImageResponse(response)),
        },
      ],
      { cancelable: true }
    );
  };

  const handleImageResponse = async (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.error('ImagePicker Error:', response.error);
    } else {
      try {
        setIsLoading(true);
        const uploadUri = Platform.OS === 'ios' ? response.assets[0].uri.replace('file://', '') : response.assets[0].uri;
        const filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);
        const storageRef = storage().ref(`profile_images/${userData.email}_${userData.uid}`);
        const task = storageRef.putFile(uploadUri);

        task.on('state_changed', 
          (snapshot) => {
           
          }, 
          (error) => {
            showMessage({
              message: 'Error in uploading Image',
              type: "error",
              backgroundColor: "white",
              color: 'red'
            });
            setIsLoading(false);
          }, 
          async () => {
            const downloadURL = await storageRef.getDownloadURL();
            setProfileImage(downloadURL);
            await firestore.collection('users').doc(userData.uid).update({
                profileImg: downloadURL,
              });
            dispatch(updateUserData({...userData,profileImg: downloadURL}))
            setIsLoading(false);
          }
        );
      } catch (error) {
        showMessage({
          message: 'Error in uploading Image',
          type: "error",
          backgroundColor: "white",
          color: 'red'
        });
        setIsLoading(false);
      }
    }
  };

  useEffect(()=>{
    if(!userData){
        navigation.navigate('Login');
    }else{
        setGender(userData.gender);
        setName(userData.name);
        setProfileImage(userData.profileImg)
    }
  },[])

  const handleLogout = async () => {
    try {
      // Sign out the user
      await auth.signOut();
      await AsyncStorage.clear();
      // Navigate to the login screen
      navigation.navigate('Login');
    } catch (error) {
      showMessage({
        message: 'Failed to logout',
        type: "error",
        backgroundColor: "white",
        color: 'red'
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
        setIsLoading(true);
      await firestore.collection('users').doc(userData.uid).update({
        name: name,
        gender: gender
      });
      dispatch(updateUserData({...userData,name,gender}))
      showMessage({
        message: 'Profile Updated',
        type: "success",
        backgroundColor: "white",
        color: 'green'
      });
    } catch (error) {
      showMessage({
        message: 'Error in updating profile',
        type: "error",
        backgroundColor: "white",
        color: 'red'
      });
    }
    setIsLoading(false);
  };

  const removeProfileImage = async () => {
    try {
      setIsLoading(true);
      
      // Remove profile image from Firebase Storage
      const filename = `${userData.email}_${userData.uid}`;
      await storage().ref(`profile_images/${filename}`).delete();
      
      // Update user's profile in Firestore to remove profileImg field
      await firestore.collection('users').doc(userData.uid).update({
        profileImg: "",
      });

      setProfileImage('');
      dispatch(updateUserData({...userData,profileImg: ''}))

      showMessage({
        message: 'Profile image removed successfully!',
        type: "success",
        backgroundColor: "white",
        color: 'green'
      });
    } catch (error) {
      showMessage({
        message: 'Error removing profile image',
        type: "error",
        backgroundColor: "white",
        color: 'red'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Image source={profileImage ? { uri: profileImage } : user} style={styles.profileImage} />
      <Text style={styles.userName}>{userData.email}</Text>
      <View style={styles.profileOptions}>
      <TouchableOpacity onPress={handleImageUpload}>
        <Text style={styles.button}>{profileImage ? 'Change': 'Add'} Profile</Text>
      </TouchableOpacity>
      {profileImage && <TouchableOpacity onPress={removeProfileImage}>
        <Text style={styles.button}>Remove Profile</Text>
      </TouchableOpacity>}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter Name"
        autoCapitalize="none"
        keyboardType="name-phone-pad"
        textContentType="name"
        value={name}
        onChangeText={(text) => setName(text)}
      />
      <Picker
        selectedValue={gender}
        style={styles.input}
        onValueChange={(itemValue, itemIndex) => setGender(itemValue)}
      >
        <Picker.Item label="Select Gender" value="" />
        <Picker.Item label="Male" value="Male" />
        <Picker.Item label="Female" value="Female" />
        <Picker.Item label="Other" value="Other" />
      </Picker>
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.updateButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f57c00" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FBCEB1',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  profileOptions:{
    display: 'flex',
    flexDirection: 'row',
    gap: 10
  },
  userName: {
    fontSize: 24,
    marginBottom: 20,
    color: 'orange',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
  },
  button: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#f57c00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 100
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
    width: '100%',
  },
  updateButton: {
    backgroundColor: '#f57c00',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },
});

export default Profile;
