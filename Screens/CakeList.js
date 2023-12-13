// CakeList.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ref, onValue,getDatabase } from "firebase/database";
import app from '../firebase/config';
import CakeCard from './CakeCard';

const CakeList = () => {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const db = getDatabase(app);
        const productsRef = ref(db, "products");
        onValue(productsRef, (snapshot) => {
          const data = snapshot.val();
          const cakesArray = [];

          if (data) {
            Object.keys(data).forEach((id) => {
              cakesArray.push({
                id,
                ...data[id],
              });
            });
          }

          setCakes(cakesArray);
        });
      } catch (error) {
        console.error('Error getting all products:', error);
      } finally {
        setLoading(false);
      }
    };

    getAllProducts();
  }, []);

  const handleCakePress = (cakeId) => {
    navigation.navigate('CakeDetailPage', { cakeId });
  };

 

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 30, fontWeight: "bold", textAlign: "center", padding: 20 }}>All Cakes</Text>
     
      <CakeCard data={cakes}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', backgroundColor: "#fff",
  },
  flatList: {
    flexGrow: 0, // Set flexGrow to 0 to remove vertical scrolling
  },
  cakeCard: {
    width: '48%',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    marginRight: 20,
  },
  cakeImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  cakeName: {
    fontSize: 16,
    color: '#000',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  cakeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingHorizontal: 10,
  },
  cakeCalories: {
    fontSize: 14,
    color: '#777',
    marginLeft: 5,
  },
  cakePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default CakeList;
