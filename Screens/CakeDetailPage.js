// CakeDetailPage.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Colors from "../assets/Colors";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  orderBy,
  limit,
  getDoc,
  doc,
} from "firebase/firestore";
import app from "../firebase/config";
import { Center } from "native-base";

const CakeDetailPage = ({ route, navigation }) => {
  const { item } = route.params;
  const bakeryID = route.params.item.bakeryID;
  const [quantity, setQuantity] = useState(1);
  const [bakeryDetail, setBakeryDetails] = useState(null);

  useEffect(() => {
    geBakeryData();
  }, []);
  const geBakeryData = async () => {
    const db = getFirestore(app);
    const bakeryRef = doc(db, "bakeries", bakeryID);
    const bakerySnapshot = await getDoc(bakeryRef);

    if (bakerySnapshot.exists()) {
      const bakeryData = bakerySnapshot.data();
      setBakeryDetails({ id: bakerySnapshot.id, ...bakeryData });
    }
  };

  const handleAddToCart = () => {
    // Add logic to add the cake to the cart
    // You can use a state management solution or dispatch an action here
    console.log("Cake added to cart:", item);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image || "https://via.placeholder.com/300" }}
            style={styles.cakeImage}
          />
        </View>
        <View style={styles.whiteContainer}>
          <View style={styles.detailsContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: Colors.primaryColor,
                  width: 70,
                  padding: 7,
                  borderRadius: 20,
                  marginLeft: 10,
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="star" size={20} color="orange" />
                <Text style={{ fontSize: 20, color: "white" }}>
                  {" "}
                  {item.averageRating}
                </Text>
              </View>
              <Text style={styles.cakePrice}>${item.price}</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.cakeName}>{item.productName}</Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => setQuantity(quantity - 1)}  style={styles.quantityButton}>
                  <Icon
                    name="minus"
                    size={20}
                    color={Colors.primaryColor}
                   
                  />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}  style={styles.quantityButton}>
                  <Icon name="plus" size={16} color={Colors.primaryColor} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cakeInfoRow}>
              <Icon name="fire" size={20} color={Colors.primaryColor} />
              <Text style={styles.cakeCalories}>{item.category}</Text>
            </View>

            <Text style={styles.cakeDescription}>{item.description}</Text>
          </View>
          {bakeryDetail && (
            <TouchableOpacity
              style={styles.bakeryDetailContainer}
              onPress={() => {
                console.log(bakeryDetail);
                navigation.navigate("BakeryDetail", { bakery: bakeryDetail });
              }}
            >
              <Image
                source={{
                  uri: bakeryDetail.image || "https://via.placeholder.com/100",
                }}
                style={styles.bakeryImage}
              />
              <View style={styles.bakeryTextContainer}>
                <Text style={styles.bakeryName}>{bakeryDetail.bakeryname}</Text>
                <Text style={styles.bakeryLocation}>
                  {bakeryDetail.location}
                </Text>
                <Text style={styles.bakeryCountry}>{bakeryDetail.country}</Text>
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.interactiveContainer}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  cakeImage: {
    width: "70%",
    height: 200,
    resizeMode: "cover",
    alignSelf: "center",

    marginTop: 30,
  },
  imageContainer: {
    shadowColor: Colors.secondaryColor,
    shadowOpacity: 0.6,
    shadowOffset: 1,
    shadowRadius: 20,
  },
  whiteContainer: {
    backgroundColor: "white",
    height: "100%",
    marginTop: 40,
    borderTopLeftRadius: 80,
    paddingVertical: 30,
  },
  detailsContainer: {
    padding: 20,
  },
  cakeName: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 10,
    padding: 10,
  },
  cakeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginLeft:10
  },
  cakeCalories: {
    fontSize: 16,
    color: "#777",
    marginLeft: 5,
  },
  cakeDescription: {
    fontSize: 16,
    marginLeft:10
  },
  cakePrice: {
    fontSize: 25,
    fontWeight: "bold",
    color: Colors.primaryColor,
  },
  interactiveContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
   
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
  
  },
  addToCartButton: {
    backgroundColor: Colors.primaryColor,
    width: "100%",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  addToCartText: {
    fontSize: 20,
    color: Colors.secondaryColor,
    textAlign: "center",
  },
  bakeryDetailContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#cccc",
    marginHorizontal:20,
    borderRadius:10
  },
  bakeryImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  bakeryTextContainer: {
    flex: 1,
  },
  bakeryName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bakeryLocation: {
    fontSize: 16,
    color: "#777",
  },
  bakeryCountry: {
    fontSize: 16,
    color: "#777",
  },
});

export default CakeDetailPage;
