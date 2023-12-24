// CakeDetailPage.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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
import { useAuth } from "../AuthContextApi";
import Modal from "react-native-modal";
import { getDatabase, ref, set, serverTimestamp } from "firebase/database";
import uuid from "react-native-uuid";
import { useToast, NativeBaseProvider } from "native-base";
const CakeDetailPage = ({ route, navigation }) => {
  const { user, updateUserInContext } = useAuth();
  const { item } = route.params;
  
  const db = getDatabase(app);
  const bakeryID = route.params.item.bakeryID;
  const [quantity, setQuantity] = useState(1);
  const [bakeryDetail, setBakeryDetails] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
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
   
    setLoading(true);

    const cartRef = ref(db, `carts/${user.uid}/${uuid.v4()}`);

    set(cartRef, {
      userId: user.uid,
      quantity: quantity,
      productID: item.id,
      createdAt: serverTimestamp(),
    })
      .then(() => {
        
        if (isModalVisible) {
          toggleModal();
        }
      })
      .catch((error) => {
        console.error('Error adding item to cart:', error);
      })
      .finally(() => {
        setLoading(false);
        toast.show({
          title: "Product added successfully",
          status: "success",
          placement: "top",
          duration: 3000,
          style: { top: "5%", backgroundColor: "#2ecc71" },
        });
      });
  };

  const handleCartChecks = () => {
    // handleAddToCart();
    if (!user) {
      navigation.navigate("Login");
    } 
    // else if (item.numberOfItems > 9) {
    //   toggleModal();
    // } 
    else {
      handleAddToCart();
    }

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
          {item.numberOfItems < 1 && (
            <Text
              style={{
                color: "white",
                backgroundColor: "red",
                borderRadius: 20,
                padding: 10,
                marginRight: 20,
                alignSelf: "center",
              }}
            >
              Out of Stock
            </Text>
          )}
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
                <TouchableOpacity
                  onPress={() => setQuantity(quantity - 1)}
                  style={styles.quantityButton}
                >
                  <Icon name="minus" size={20} color={Colors.primaryColor} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(quantity + 1)}
                  style={styles.quantityButton}
                >
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
              onPress={handleCartChecks}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.secondaryColor} />
              ) : (
                <Text style={styles.addToCartText}>Add to Cart</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ------------------------------Modal Start---------------------------------------------------------------- */}
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
            <Icon name="times" size={20} color="black" />
          </TouchableOpacity>
          <Text
            style={{
              textAlign: "left",
              padding: 5,
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 5,
            }}
          >
            This Product is Out of Stock!
          </Text>

          <Text
            style={{
              textAlign: "left",
              padding: 5,
              fontSize: 16,

              marginTop: 5,
              marginBottom: 20,
            }}
          >
            Dont Worry 🥳🥳🥳 You can Purchase it. But Might b possible it
            deilver 2 or 3 days late than normal time ~{"\n"} Are You Sure to
            Add to Cart
          </Text>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.secondaryColor} />
            ) : (
              <Text style={styles.addToCartText}>Ok, Sure</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
      {/* ----------------------------Modal End--------------------------------------------------------------------------*/}
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
    resizeMode: "contain",
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
    marginLeft: 10,
  },
  cakeCalories: {
    fontSize: 16,
    color: "#777",
    marginLeft: 5,
  },
  cakeDescription: {
    fontSize: 16,
    marginLeft: 10,
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
    marginHorizontal: 20,
    borderRadius: 10,
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
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  modalImage: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 16,
  },
});

export default CakeDetailPage;
