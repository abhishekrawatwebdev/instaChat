import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { firestore } from '../../firebase';
import { useSelector } from 'react-redux';

const Chats = () => {
  const userData = useSelector(state => state.user.userData);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(()=>{
    if(!userData){
        navigation.navigate('Login');
    }
  },[])

  const navigateToChat = (contact) => {
    try {
      navigation.navigate('Chat', { ...contact});
    } catch (err) {
      showMessage({
        message: 'Failed to navigate',
        type: "error",
        backgroundColor: "white",
        color: 'red'
      });
    }
  };

  const renderContactItem = ({ item }) => {
    return (
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => navigateToChat(item)}
        >
          <Text style={styles.contactName}>{item.name}</Text>
        </TouchableOpacity>
      )
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredContacts = userData?.contacts ? userData?.contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <View style={styles.chatsContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search contacts"
        onChangeText={handleSearch}
        value={searchQuery}
      />
      {filteredContacts && filteredContacts.length > 0 ? (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.email}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No contacts available</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chatsContainer: {
    backgroundColor: '#FBCEB1',
    flex: 1,
    paddingTop: 65,
    flexDirection: 'column',
  },
  searchInput: {
    backgroundColor: '#F2D2BD',
    paddingHorizontal: 10,
    borderColor: 'white',
    borderWidth: 1,
    paddingVertical: 8,
    margin: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomColor: 'white',
    borderBottomWidth: 2,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlignVertical: 'center',
  },
});

export default Chats;
