import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import RewardRuleScreen from './screens/RewardRuleScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for token on app start
    AsyncStorage.getItem('token').then(setToken);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token ? (
          <>
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} token={token} setToken={setToken} />}
            </Stack.Screen>
            <Stack.Screen name="RewardRule">
              {(props) => <RewardRuleScreen {...props} token={token} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} setToken={setToken} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}