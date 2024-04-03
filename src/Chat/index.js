import React, { useState, useCallback, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Video from 'react-native-video';
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import { useRoute } from "@react-navigation/native";
import { Bubble, GiftedChat } from "react-native-gifted-chat";
import gallery from "../assets/gallery.png";
import camera from "../assets/camera.png";
import clapperboard from "../assets/clapperboard.png";
import user from '../assets/user.png';
import leftChevron from '../assets/left-chevron.png';
import { useSelector } from "react-redux";
import { showMessage } from "react-native-flash-message";

function Chat({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const userData = useSelector(state => state.user.userData);
  const route = useRoute();

  useEffect(() => {
    navigation.setOptions({
      title: route.params.name,
    });
    navigation.setOptions({
        header: () => <CustomHeader navigation={navigation} />,
      });

    const subscriber = firestore()
      .collection("chats")
      .doc(route.params.uid + userData.uid)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .onSnapshot((querySnapshot) => {
        const allMessages = querySnapshot.docs.map((item) => {
          return { ...item._data };
        });
        setMessages(allMessages);
      });

    return () => subscriber();
  }, []);

  const onSend = useCallback((newMessages = []) => {
    const message = newMessages[0];
    const myMsg = {
      ...message,
      senderId: userData?.uid,
      receiverId: route.params.uid,
      createdAt: new Date().getTime() * 1000,
    };

    firestore()
      .collection("chats")
      .doc(route.params.uid + userData.uid)
      .collection("messages")
      .add(myMsg);

    firestore()
      .collection("chats")
      .doc(userData.uid + route.params.uid)
      .collection("messages")
      .add(myMsg);

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, myMsg)
    );
  }, []);

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: "mixed" }, (response) =>
      handleMediaResponse(response)
    );
  };

  const handleTakePhoto = () => {
    launchCamera({ mediaType: "photo" }, (response) =>
      handleMediaResponse(response)
    );
  };

  const handleTakeVideo = () => {
    launchCamera({ mediaType: "video" }, (response) =>
      handleMediaResponse(response)
    );
  };

  const handleMediaResponse = async(response) => {
    if (!response.didCancel && !response.error) {
      if (response.assets[0].type.startsWith("image")) {
        const imageUri = response.assets[0].uri;
        const imageName = imageUri.substring(imageUri.lastIndexOf("/") + 1);
        const storageRef = storage().ref(`images/${imageName}`);
        await storageRef.putFile(imageUri);
        const imageUrl = await storageRef.getDownloadURL();

        const imageMessage = {
          _id: new Date().getTime(),
          type: 'image',
          image: imageUrl,
          createdAt: new Date(),
          user: { _id: userData.uid },
        };
        onSend([imageMessage]);
      } else if (response.assets[0].type.startsWith("video")) {
        const videoUri = response.assets[0].uri;
      const videoName = videoUri.substring(videoUri.lastIndexOf("/") + 1);
      const storageRef = storage().ref(`videos/${videoName}`);
      await storageRef.putFile(videoUri);
      const videoUrl = await storageRef.getDownloadURL();

      const videoMessage = {
        _id: new Date().getTime(),
        type: 'video',
        video: videoUrl,
        createdAt: new Date(),
        user: { _id: userData.uid },
      };
      onSend([videoMessage]);
      } else {
        showMessage({
          message: 'Unsupported media type',
          type: "error",
          backgroundColor: "white",
          color: 'red'
        });
      }
    }
  };

  const CustomBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "white",
          },
          right: {
            backgroundColor: "#f57c00",
          },
        }}
        textStyle={{
          left: {
            color: "black",
          },
          right: {
            color: "white",
          },
        }}
      />
    );
  };


  const CustomHeader = ({ navigation }) => {
    const handleBackPress = () => {
      navigation.goBack();
    };
  
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Image source={leftChevron} style={styles.backButton} />
        </TouchableOpacity>
        <Image source={user} style={styles.avatar} />
        <Text style={styles.headerName}>{route.params.name}</Text>
      </View>
    );
  };

  const CustomVideoMessage = (props) => {
    return (
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: props.currentMessage.video }}
          style={styles.video}
          resizeMode="cover"
          controls
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: userData.uid }}
        renderBubble={(props) => <CustomBubble {...props} />}
        renderMessageVideo={(props) => <CustomVideoMessage {...props} />}
        renderActions={() => (
          <TouchableOpacity
            style={[styles.button]}
            onPress={() => setMoreModalOpen(!moreModalOpen)}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        )}
      />
      {moreModalOpen && (
        <View style={styles.moreOptionsBox}>
          <TouchableOpacity onPress={handlePickImage}>
            <View style={styles.options}>
              <Image style={styles.chatOptionImage} source={gallery} />
              <Text style={styles.chatOptionText}>Photo</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTakePhoto}>
            <View style={styles.options}>
              <Image style={styles.chatOptionImage} source={camera} />
              <Text style={styles.chatOptionText}>Camera</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTakeVideo}>
            <View style={styles.options}>
              <Image style={styles.chatOptionImage} source={clapperboard} />
              <Text style={styles.chatOptionText}>Video</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  moreOptionsBox: {
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
    flexDirection: "column",
    gap: 25,
    marginBottom: 10,
    position: "absolute",
    bottom: 40,
    left: 7,
    width: 120,
    borderRadius: 15
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'orange',
    height:65,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  headerName:{
    fontSize: 20,
    marginLeft:10
  },
  backButton: {
    width: 40,
    height: 40,
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  options: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatOptionImage: {
    height: 50,
    width: 50,
  },
  button: {
    backgroundColor: "orange",
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginLeft:6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bubble: {
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    maxWidth: "80%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
});

export default Chat;
