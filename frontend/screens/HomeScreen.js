import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ setToken }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Auto Card!</Text>
      <Button title="Logout" onPress={handleLogout} />
      {/* We'll add more features here soon */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
});
