// CakeCard.js
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import Colors from "../assets/Colors";
// import { color } from "native-base/lib/typescript/theme/styled-system";

const CakeCard = (props) => {
  const navigation = useNavigation();

  const handleCakePress = (cakeId) => {
    // Navigate to the CakeDetailPage with the cake ID
    navigation.navigate("CakeDetailPage", { item: cakeId });
  };

  const renderPopularCakeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cakeCard}
      onPress={() => handleCakePress(item)}
    >
      <View style={styles.ratingContainer}>
        <Icon name="star" size={15} color="white" />
        <Text style={styles.ratingText}> {item.averageRating}</Text>
      </View>
      
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.cakeImage}
      />
      <Text style={styles.cakeName}>{item.productName}</Text>
      <View style={styles.cakeInfoRow}>
        <Text style={styles.cakePrice}>${item.price}</Text>
        <TouchableOpacity style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Icon name="plus" size={12} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <FlatList
        data={props.data}
        keyExtractor={(item) => item.id}
        renderItem={renderPopularCakeItem}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cakeCard: {
    width: "48%",
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "rgba(227, 227, 227, 0.6)",
    marginRight: 10,
    // position:"relative",
  },
  cakeImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: "#f9f9f9",
    resizeMode: "contain",
  },
  cakeName: {
    fontSize: 18,
    color: "#333",
    marginTop: 10,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  cakeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cakePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(193, 151, 41, 0.94)",
    marginTop: 5,
  },
  iconContainer: {
    backgroundColor: "transparent",
    borderRadius: 50,
  },
  iconCircle: {
    backgroundColor: "black",
    padding: 6,
    borderRadius: 50,
    width: 22,  
    height: 23, 
  
  },
  ratingContainer:{
    flexDirection: "row",
    backgroundColor: Colors.primaryColor,
    width: 40,
    borderTopRightRadius: 10,
    justifyContent: "space-evenly",
    padding: 7,
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
  },
  ratingText: {
    color: "white",
    fontSize: 15,
  },
});

export default CakeCard;
