import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Colors from "../assets/Colors";
import {
  ref,
  orderBy,
  query,
  onValue,
  getDatabase,
  orderByChild,
} from "firebase/database";
import app from "../firebase/config";
import { useNavigation } from "@react-navigation/native";

const AllCategory = () => {
  const [categories, setCategories] = useState([]);
  const database = getDatabase(app);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRef = ref(database, "products");
        const queryResult = query(productsRef, orderByChild("category"));
        
        onValue(queryResult, (snapshot) => {
          const data = snapshot.val();
          const categoryArray=[]
          if (data) {
            Object.values(data).forEach((product) => {
              if (!categoryArray.includes(product.category)) {
                categoryArray.push(product.category);
              }
            });
          }
          setCategories(categoryArray);
        });
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, []);

  const onCategoryPress = (category) => {
    console.log("Category Pressed:", category);
    navigation.navigate('CakesByCategory',{category})
  };

  const renderCategoryItem = (category, index) => (
    <TouchableOpacity
      key={index}
      style={styles.categoryButton}
      onPress={() => onCategoryPress(category)}
    >
      <View style={styles.categoryCircle}>
        <Icon name="birthday-cake" size={25} color="white" />
        <Text style={styles.categoryButtonText}>{category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoriesInRows = () => {
    const rows = [];
    for (let i = 0; i < categories.length; i += 3) {
      const row = (
        <View key={i} style={styles.rowContainer}>
          {renderCategoryItem(categories[i], i)}
          {i + 1 < categories.length && renderCategoryItem(categories[i + 1], i + 1)}
          {i + 2 < categories.length && renderCategoryItem(categories[i + 2], i + 2)}
        </View>
      );
      rows.push(row);
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 30, fontWeight: "bold", textAlign: "center",paddingBottom:30 }}>All Categories</Text>
      {renderCategoriesInRows()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoryButton: {
    alignItems: "center",
  },
  categoryCircle: {
    backgroundColor: Colors.primaryColor,
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    padding:10
  },
  categoryButtonText: {
    marginTop: 15,
    fontSize: 15,
    color: "white",
  },
});

export default AllCategory;
