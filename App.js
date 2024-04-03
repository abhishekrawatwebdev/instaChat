import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./src/Login";
import Signup from "./src/Signup";
import Chats from "./src/Chats";
import Chat from "./src/Chat";
import Profile from "./src/Profile";
import Header from "./src/components/Header";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import FlashMessage from "react-native-flash-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userDataJson = await AsyncStorage.getItem("@user_data");
        if (userDataJson !== null) {
          const userData = JSON.parse(userDataJson);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking user data:", error);
      } finally {
        setInitializing(false);
      }
    };

    checkUser();
  }, []);

  if (initializing) {
    return null; // Render nothing while initializing
  }

  return (
    <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={user ? "Chats" : "Login"}>
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
              component={Login}
            />
            <Stack.Screen
              name="Signup"
              options={{ headerShown: false }}
              component={Signup}
            />
            <Stack.Screen
              name="Chats"
              options={{ header: () => <Header /> }}
              component={Chats}
            />
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="Profile" component={Profile} />
          </Stack.Navigator>
        </NavigationContainer>
        <FlashMessage position="top" />
      </Provider>
  );
};

export default App;
