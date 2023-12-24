// Cart.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Colors from "../assets/Colors";
import { getDatabase, ref, onValue, get,remove } from "firebase/database";
import app from "../firebase/config";
import { useAuth } from "../AuthContextApi";

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    if (user) {
      const db = getDatabase(app);
      const cartRef = ref(db, `carts/${user.uid}`);
  
      const unsubscribe = onValue(cartRef, (snapshot) => {
        const cartData = snapshot.val();
        if (cartData) {
          const items = Object.values(cartData).map((item, index) => ({
            ...item,
            id: Object.keys(cartData)[index],
          }));
          
          setCartItems(items);
          fetchProductDetails(items);
        } else {
          setCartItems([]);
          setProductDetails({});
        }
      });
  
      // Unsubscribe when component unmounts
      return () => unsubscribe();
    }
  }, [user]);
  

  const fetchProductDetails = async (cartItems) => {
    const db = getDatabase(app);
    const productDetailsPromises = cartItems.map(async (cartItem) => {
      const productRef = ref(db, `products/${cartItem.productID}`);
      const productSnapshot = await get(productRef);
      return {
        id: cartItem.productID,
        ...productSnapshot.val(),
        quantity: cartItem.quantity,
      };
    });

    const fetchedProductDetails = await Promise.all(productDetailsPromises);
    const productDetailsMap = {};
    fetchedProductDetails.forEach((product) => {
      productDetailsMap[product.id] = product;
    });

    setProductDetails(productDetailsMap);
  };

  const onUpdateQuantity = (productId, newQuantity) => {
    const updatedCart = cartItems.map((item) =>
      item.productID === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
  };

  const onRemoveItem =async (item) => {
      const db = getDatabase(app);
      const deleteItemRef = ref(db, `carts/${user.uid}/${item.id}`);
      await remove(deleteItemRef)
    console.log(deleteItemRef);
  };

  const onCheckout = () => {
    // Handle checkout logic here
    console.log("Checkout clicked");
    console.log("Special Instructions:", specialInstructions);
    console.log("Cart Items:", cartItems);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{
          uri:
            productDetails[item.productID]?.image ||
            "https://via.placeholder.com/100",
        }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>
          {productDetails[item.productID]?.productName}
        </Text>
        <Text style={styles.itemPrice}>
          ${productDetails[item.productID]?.price}
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => onUpdateQuantity(item.productID, item.quantity - 1)}
          >
            <Icon name="minus" size={20} color={Colors.primaryColor} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => onUpdateQuantity(item.productID, item.quantity + 1)}
          >
            <Icon name="plus" size={16} color={Colors.primaryColor} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onRemoveItem(item)}
        style={styles.removeButton}
      >
        <Icon name="times" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyCartContainer}>
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
      </View>
    );
  }

  const totalAmount = cartItems.reduce((total, item) => {
    return total + productDetails[item.productID]?.price * item.quantity;
  }, 0);

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.header}>
          {cartItems.length} {cartItems.length > 1 ? "items" : "item"} in Cart
        </Text>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.productID}
          renderItem={renderCartItem}
        />

        <TextInput
          style={styles.specialInstructions}
          placeholder="Special Instructions"
          value={specialInstructions}
          onChangeText={(text) => setSpecialInstructions(text)}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.totalAmount}>Total Amount:</Text>
          <Text style={[styles.totalAmount, { color: Colors.primaryColor }]}>
            {" "}
            ${totalAmount.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  emptyCartContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: 18,
    color: Colors.primaryColor,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    padding: 10,
    borderColor: Colors.primaryColor,
    borderRadius: 20,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    marginLeft: 20,
    flexDirection: "column",
    // alignItems: "center",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 16,
    color: Colors.primaryColor,
    // backgroundColor:"red",
    // marginLeft: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  removeButton: {
    marginLeft: "auto",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  specialInstructions: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    height: 50,
    marginTop: 10,
  },
  checkoutButton: {
    backgroundColor: Colors.primaryColor,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutButtonText: {
    fontSize: 18,
    color: Colors.secondaryColor,
  },
});

export default Cart;
