import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Modal, TextInput } from 'react-native';

const CardManagementScreen = ({ token }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [cardName, setCardName] = useState('');
  const [lastFour, setLastFour] = useState('');

  // State variables to hold the list of cards, loading status, and any errors.
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect hook to fetch cards from the backend when the component mounts.
  useEffect(() => {
    const fetchCards = async () => {
      try {
        // Fetching data from the /cards endpoint.
        const response = await fetch('http://127.0.0.1:5000/cards', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // The JWT token is required for authentication.
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          // If the request was successful, update the cards state.
          setCards(data);
        } else {
          // If there was an error, update the error state.
          setError(data.error || 'Something went wrong');
        }
      } catch (e) {
        // Handle network errors.
        setError('Network request failed');
      } finally {
        // Set loading to false after the request is complete.
        setLoading(false);
      }
    };

    fetchCards();
  }, [token]); // The effect depends on the token, so it will re-run if the token changes.

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

  // Render a loading message while the data is being fetched.
  if (loading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  // Render an error message if something went wrong.
  if (error) {
    return <View style={styles.container}><Text>Error: {error}</Text></View>;
  }

  // Render the list of cards using a FlatList.
  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>{item.name}</Text>
            <Text style={styles.cardText}>**** **** **** {item.last_four}</Text>
            <Button title="Delete" onPress={() => handleDeleteCard(item.id)} />
          </View>
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
    </View>
  );
};

// Basic styling for the component.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardText: {
    fontSize: 16,
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

export default CardManagementScreen;
