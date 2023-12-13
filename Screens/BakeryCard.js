// BakeryCard.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Colors from "../assets/Colors";
import {
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";
import app from "../firebase/config";
import { useNavigation } from "@react-navigation/native";

const BakeryCard = () => {
  const [allBakeries, setAllBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const getAllBakeries = async () => {
    setLoading(true);
    const db = getFirestore(app);
    const bakeryCollection = collection(db, "bakeries");

    try {
      const bakerySnapshot = await getDocs(bakeryCollection);
      const allBakeries = bakerySnapshot.docs.map((bakeryDoc) => ({
        bakeryId: bakeryDoc.id,
        ...bakeryDoc.data(),
      }));
      
      setAllBakeries(allBakeries);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bakeries:", error);
      throw error;
    }
  };

  useEffect(() => {
    getAllBakeries().catch((error) =>
      console.error("Error fetching bakeries:", error)
    );
  }, []);

  if (loading) {
    return (
      <ActivityIndicator size="large" color={Colors.primaryColor} />
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {allBakeries.map((bakery) => (
        <TouchableOpacity
          key={bakery.bakeryId}
          style={styles.cardContainer}
          onPress={() => {
            console.log(bakery);
            navigation.navigate('BakeryDetail', { bakery })}}
        >
          <Image source={{ uri: bakery.image }} style={styles.bakeryImage} />
          <View style={styles.textContainer}>
            <Text style={styles.bakeryName}>{bakery.bakeryname}</Text>
            <Text style={styles.ownerName}>{bakery.ownername}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 200,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    marginHorizontal: 15,
    borderColor: "lightgrey",
  },
  bakeryImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderRadius: 10,
  },
  textContainer: {
    padding: 10,
  },
  bakeryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  ownerName: {
    fontSize: 14,
    color: Colors.primaryColor,
  },
});

export default BakeryCard;
