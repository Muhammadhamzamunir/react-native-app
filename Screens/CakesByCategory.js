import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  onValue,
  getDatabase,
} from "firebase/database";
import app from "../firebase/config";
import CakeCard from "./CakeCard";

const CakesByCategory = ({ route }) => {
  const { category } = route.params;
  const [cakes, setCakes] = useState([]);
  const database = getDatabase(app);

  
  useEffect(() => {
    const fetchCakesByCategory = async () => {
      try {
        if (!category) {
          console.error("Category is undefined");
          return;
        }

        const productsRef = ref(database, "products");
        const categoryQuery = query(productsRef, orderByChild("category"), equalTo(category));

        onValue(categoryQuery, (snapshot) => {
          const data = snapshot.val();
          const cakesArray = data ? Object.values(data) : [];

          setCakes(cakesArray);
        });
      } catch (error) {
        console.error("Error fetching cakes by category:", error.message);
      }
    };

    fetchCakesByCategory();
  }, [category]);



  return (
    <View style={styles.container}>
      <Text style={styles.categoryHeading}>{category}</Text>
      <CakeCard data={cakes}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 20,
  },
  categoryHeading: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  
});

export default CakesByCategory;
