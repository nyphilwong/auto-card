import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Modal, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation, token, setToken }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [cardName, setCardName] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/cards', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setCards(data);
        } else {
          setError(data.error || 'Something went wrong');
        }
      } catch (e) {
        setError('Network request failed');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [token]);

  const handleAddCard = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: cardName, last_four: lastFour }),
      });

      const data = await response.json();

      if (response.ok) {
        setCards([...cards, { id: data.card_id, name: cardName, last_four: lastFour }]);
        setModalVisible(false);
        setCardName('');
        setLastFour('');
      } else {
        alert(data.error || 'Failed to add card');
      }
    } catch (e) {
      alert('Network request failed');
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/cards/${cardId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

      if (response.ok) {
        setCards(cards.filter(card => card.id !== cardId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete card');
      }
    } catch (e) {
      alert('Network request failed');
    }
  };
  
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
  };

  if (loading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.container}><Text>Error: {error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cards</Text>
      <FlatList
        data={cards}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('RewardRule', { cardId: item.id, token: token })}>
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.name}</Text>
              <Text style={styles.cardText}>**** **** **** {item.last_four}</Text>
              <Button title="Delete" onPress={() => handleDeleteCard(item.id)} />
            </View>
          </TouchableOpacity>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              placeholder="Card Name"
              value={cardName}
              onChangeText={setCardName}
              style={styles.input}
            />
            <TextInput
              placeholder="Last Four Digits"
              value={lastFour}
              onChangeText={setLastFour}
              style={styles.input}
              keyboardType="numeric"
              maxLength={4}
            />
            <Button title="Add Card" onPress={handleAddCard} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Button title="Add New Card" onPress={() => setModalVisible(true)} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    width: width - 40,
    height: 200,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  cardText: {
    fontSize: 18,
    color: '#333'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: 200,
    padding: 10,
  }
});

export default HomeScreen;
