import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Modal, TextInput } from 'react-native';

const RewardRuleScreen = ({ route, token }) => {
  const { cardId } = route.params;
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [rewardType, setRewardType] = useState('');
  const [rewardValue, setRewardValue] = useState('');

  useEffect(() => {
    const fetchRewardRules = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/reward_rules/${cardId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setRules(data);
        } else {
          setError(data.error || 'Something went wrong');
        }
      } catch (e) {
        setError('Network request failed');
      } finally {
        setLoading(false);
      }
    };

    fetchRewardRules();
  }, [cardId, token]);

  const handleAddRule = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/reward_rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          card_id: cardId,
          category: category,
          reward_type: rewardType,
          reward_value: parseFloat(rewardValue),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRules([...rules, { id: data.rule_id, category, reward_type: rewardType, reward_value: parseFloat(rewardValue) }]);
        setModalVisible(false);
        setCategory('');
        setRewardType('');
        setRewardValue('');
      } else {
        alert(data.error || 'Failed to add reward rule');
      }
    } catch (e) {
      alert('Network request failed');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/reward_rules/${ruleId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

      if (response.ok) {
        setRules(rules.filter(rule => rule.id !== ruleId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete reward rule');
      }
    } catch (e) {
      alert('Network request failed');
    }
  };

  if (loading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.container}><Text>Error: {error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.rule}>
            <Text style={styles.ruleText}>{item.category}: {item.reward_value}{item.reward_type === 'cashback' ? '%' : 'x'}</Text>
            <Button title="Delete" onPress={() => handleDeleteRule(item.id)} />
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
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
              style={styles.input}
            />
            <TextInput
              placeholder="Reward Type (points/cashback)"
              value={rewardType}
              onChangeText={setRewardType}
              style={styles.input}
            />
            <TextInput
              placeholder="Reward Value"
              value={rewardValue}
              onChangeText={setRewardValue}
              style={styles.input}
              keyboardType="numeric"
            />
            <Button title="Add Rule" onPress={handleAddRule} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Button title="Add New Rule" onPress={() => setModalVisible(true)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  rule: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ruleText: {
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

export default RewardRuleScreen;
