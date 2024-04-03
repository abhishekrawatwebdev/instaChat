import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';

const Header = () => {
  const navigation = useNavigation();
  const [email,setEmail] = useState('')
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const userData = useSelector(state => state.user.userData);
  const goToProfile = () => {
    navigation.navigate('Profile');
  };

  const handleAddContact = async()=>{
    try {
      // Query the users collection for the user with the searched email
      const querySnapshot = await firestore().collection('users').where('email', '==', email).get();
  
      if (querySnapshot.empty) {
        // If no user found with the searched email, show an error or handle it accordingly
        console.log('No user found with the provided email.');
        return;
      }
  
      // Assuming there's only one user with the searched email, get the first document
      const userDetails = querySnapshot.docs[0].data();
      // Get the ID of the logged-in user (you need to implement this based on your authentication setup)
      const uid = querySnapshot.docs[0].id
      const userDetailsContacts = userDetails.contacts || [];
      const updatedUserDetailsContacts = [...userDetailsContacts,{email: userData.email, name: userData.name, uid: userData.uid }]


      const existingContacts = userData.contacts || [];
      
      // Create a new contacts array by combining the existing contacts with the new contact data
      const updatedContacts = [...existingContacts, { email: userDetails.email, name: userDetails.name, uid }];

    // Update the contacts array field of the user with the updated contacts
    await firestore().collection('users').doc(userData.uid).set(
      {
        contacts: updatedContacts
      },
      { merge: true }
    );

    await firestore().collection('users').doc(uid).set(
      {
        contacts: updatedUserDetailsContacts
      },
      { merge: true }
    );
      console.log('Contact added successfully.');
      setEmail('');
  
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  }

  return (
    <View style={[styles.header, { backgroundColor: 'orange' }]}>
      <Text style={[styles.title, { color: '#fff' }]}>Chats</Text>
      <View style={styles.headerNavigation}>
      <TouchableOpacity onPress={()=>setIsAddModalVisible(true)}>
        <Text style={[styles.profileLink, { color: '#fff' }]}>Add</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToProfile}>
        <Text style={[styles.profileLink, { color: '#fff' }]}>Profile</Text>
      </TouchableOpacity>
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={()=>setIsAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              onChangeText={setEmail}
              value={email}
            />
            <TouchableOpacity style={styles.button} onPress={handleAddContact}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={()=>setIsAddModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 65,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'absolute',
    width: '100%',
    top: '0'
  },
  headerNavigation:{
    display: 'flex',
    flexDirection: 'row',
    gap: 25
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  profileLink: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'orange',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop:12
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Header;
