import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Colors from "../assets/Colors";
import { useAuth } from "../AuthContextApi";
import ImageSlider from "./ImageSlider";
import BakeryCard from "./BakeryCard";
import CakeList from "./CakeList";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "../firebase/config";
import { useNavigation } from "@react-navigation/native";
import {
  ref,
  orderBy,
  limit,
  query,
  get,
  getDatabase,
  orderByChild,
  exists,
  onValue,
  equalTo,
  limitToFirst,
  limitToLast,
} from "firebase/database";
import CakeCard from "./CakeCard";
import SearchBarDropdown from "./SearchBarDropdown";
import { LinearGradient } from "expo-linear-gradient";


const Home = () => {
  const { user, updateUserInContext } = useAuth();
  const db = getFirestore(app);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [popularCakes, setPopularCakes] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();
  const database = getDatabase(app);
  useEffect(() => {
    getCategories();
    getPopularCakes();
  }, []);
  const productsRef = ref(database, "products");
  const getCategories = () => {
    try {
      const queryResult = query(
        productsRef,
        orderByChild("category"),
        limitToFirst(4)
      );
  
      onValue(queryResult, (snapshot) => {
        const data = snapshot.val();
        const categoryArray = [];

        if (data) {
          Object.values(data).forEach((product) => {
            if (!categoryArray.includes(product.category)) {
              categoryArray.push(product.category);
            }
          });
        }
        setCategories(categoryArray);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const getPopularCakes = () => {
    const PopularCakesQueryResult = query(
      productsRef,
      orderByChild("averageRating"),
      limitToLast(5)
    );

    onValue(PopularCakesQueryResult, (snapshot) => {
      const data = snapshot.val();
      const popularCakesArray = [];

      if (data) {
        Object.keys(data)
          .sort((a, b) => data[b].averageRating - data[a].averageRating)
          .slice(0, 4)
          .forEach((id) => {
            popularCakesArray.push({
              id,
              ...data[id],
            });
          });
      }

      setPopularCakes(popularCakesArray);
      setLoading(false);
    });
  };
  const onCategoryPress = (category) => {
    navigation.navigate("CakesByCategory", { category });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryButton}
      key={item}
      onPress={() => onCategoryPress(item)}
    >
      <Image
        style={{ width: 100, height: 80, borderRadius: 20 }}
        source={require("../assets/category.png")}
      ></Image>
      <Text style={styles.categoryButtonText}>{item}</Text>
    </TouchableOpacity>
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const searchCategories = ["Bakery", "Cake Name", "Category"];

  return (
   
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primaryColor}
        />
      }
    >
      {/* <Signup/> */}
      {/* User Profile  */}
      <View style={styles.header}>
        <View style={styles.userProfileContainer}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {/* {user ? user.username : ""} */}
              SPESHSLICE
            </Text>
            {/* <Text style={styles.userAddress}>{user && user.email}</Text> */}
          </View>
        </View>
        <Image
          source={require("../assets/splash.png")}
          style={styles.userProfileImage}
        />
      </View>

      {/* searchBar  */}
      <SearchBarDropdown />

      {/* Categories */}
      <View style={styles.container}>
        <View style={styles.categoryContainer}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
          
          {/* <View style={{flex:1, alignItems: "flex-end", marginRight: 20 }}>
  <TouchableOpacity onPress={() => navigation.navigate("AllCategory")}>
    <Text style={{ color: Colors.primaryColor }}>View all</Text>
  </TouchableOpacity>
</View> */}

          </View>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primaryColor} />
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={renderCategoryItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ margin: 10 }}
            />
          )}
        </View>

        {/* promotion */}
        <Text style={[styles.categoryHeading, { marginLeft: 15 }]}>
          Promotions
        </Text>
        <View style={styles.promotionContainer}>
          <LinearGradient
            colors={["rgba(0, 0, 0, 0.20)", "rgba(0, 0, 0, 0.20)"]}
            style={[StyleSheet.absoluteFill,{borderRadius:20}]}
          />
          <LinearGradient
            colors={["rgba(193, 123, 41, 0.94)", "rgba(193, 123, 41, 0.19)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill,{borderRadius:20}]}
          />
          <View style={styles.textContainer}>
            <Text style={styles.offerTitle}>Today’s Offer</Text>
            <Text style={styles.offerDetail}>Free box of Milk</Text>
            <Text style={styles.offerDetail}>Free box of Milk</Text>
            <Text style={styles.offerDetail}>on all orders above Rp15.000</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/promotion.png")}
              style={styles.image}
            />
          </View>
        </View>
        {!user ? (
        <View style={styles.regbakeryView}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="bullhorn" size={25} color={Colors.primaryColor} />
            <Text
              style={{
                fontSize: 25,
                fontWeight: "bold",
                marginLeft: 5,
              }}
            >
              Register Your Bakery
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 0.6 }}>
              <Text style={styles.regBakeryText}>
                A Good Platform to grow your business. Join us Now!😎 and Enjoy
                lot of Traffic on your website and earn lot of Money.🥳🎉
                {"\n"}
              </Text>
              <Text> Click On The Button Now!👇</Text>
              <TouchableOpacity
                style={styles.registerNowButton}
                onPress={() => navigation.navigate("RegisterBakery")}
              >
                <Text style={styles.registerNowText}>Register Now</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 0.4, marginLeft: 10 }}>
              <Image
                source={require("../assets/click.png")}
                style={styles.img}
              />
            </View>
          </View>
        </View>
      ) : (
        user &&
        !user.isBakeryRegistered && (
          <View style={styles.regbakeryView}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name="bullhorn" size={25} color={Colors.primaryColor} />
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: "bold",
                  marginLeft: 5,
                 
                }}
              >
                Register Your Bakery
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 0.6 }}>
                <Text style={styles.regBakeryText}>
                  A Good Platform to grow your business. Join us Now!😎 and
                  Enjoy lot of Traffic on your website and earn lot of
                  Money.🥳🎉
                  {"\n"}
                </Text>
                <Text> Click On The Button Now!👇</Text>
                <TouchableOpacity
                  style={styles.registerNowButton}
                  onPress={() => navigation.navigate("RegisterBakery")}
                >
                  <Text style={styles.registerNowText}>Register Now</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 0.4, marginLeft: 10 }}>
                <Image
                  source={require("../assets/click.png")}
                  style={styles.img}
                />
              </View>
            </View>
          </View>
        )
      )}

        {/* popularCakesContainer */}
        <View style={styles.popularCakesContainer}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={[styles.categoryHeading]}>
          Popular Cakes
        </Text>
            <TouchableOpacity onPress={() => navigation.navigate("CakeList")}>
              <Text style={{ color: Colors.primaryColor }}>View all </Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primaryColor} />
          ) : (
            <CakeCard data={popularCakes} />
          )}
        </View>
      </View>

      {/* Bakeries Section */}
      <View style={styles.bakeriesContainer}>
        <Text style={styles.bakeriesHeading}>All Registered Bakeries</Text>
        <BakeryCard onRefresh={onRefresh} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    zIndex: -1,
  },
  header: {
    paddingTop: 30,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userProfileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 10,
    borderWidth: 4,
  },
  userInfo: {
    flexDirection: "column",
    marginBottom:10
  },
  userName: {
    fontSize: 27,
    fontWeight: "bold",
    color: "black",
    padding: 5,
    letterSpacing:5,
    // color:Colors.primaryColor
  },
  userAddress: {
    fontSize: 13,
    color: "#777",
  },
  bakeriesContainer: {
    padding: 20,
    marginTop: 10,
  },
  bakeriesHeading: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  searchContainer: {
    shadowOpacity: 0.6,
    shadowColor: Colors.primaryColor,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    width: "80%",
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 5,
    backgroundColor: "white",
    // placeholderTextColor: Colors.primaryColor,
  },
  filterIcon: {
    padding: 6,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: Colors.primaryColor,
  },

  productName: {
    fontSize: 16,
    color: "#000",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  categoryContainer: {
  
    marginTop: 10,
   
  },
  categoryHeading: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginBottom:10
  },
  categoryButton: {
    marginRight: 5,
    padding: 10,
    borderRadius: 20,
    flexDirection: "column",
    alignItems: "center",
 
    borderColor: Colors.grey,
    width: 120,
   
  },
  categoryButtonText: {
    fontSize: 14,
    paddingVertical: 5,
    color: "#7C7C7C",
  
  },

  popularCakesContainer: {
    padding: 20,
  },
  popularCakesHeading: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  popularCakesContainer: {
    padding: 20,
  },
  popularCakesHeading: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  promotionContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.20)",
    borderRadius: 20,
    margin:10,
 
  },
  textContainer: {
    flex: 1,
    padding: 20,
  },
  offerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  offerDetail: {
    fontSize: 15,
    paddingHorizontal:10,
    color: "white",
    marginBottom: 10,
  },
  imageContainer: {
    position: 'absolute',
    top: -50, 
    right: -30, 
    
  },
  image: {
    width: 250,
    height: 180,
  },  regbakeryView: {
    padding: 10,
    paddingBottom: 5,
   
    backgroundColor: "rgba(172, 104, 22, 0.19)",
    
    marginHorizontal:15,
    borderRadius:20
  },
  regBakeryText: {
    padding: 6,
    color: "grey",
    marginTop: 4,
    paddingBottom: 0,
  },
  registerNowButton: {
    borderWidth: 3,
    borderColor: Colors.primaryColor,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  registerNowText: {
    color: Colors.primaryColor,
    fontSize: 16,
    fontWeight: "bold",

    textAlign: "center",
  },
  img: {
    marginTop: -14,
    marginBottom: 0,
    padding: 0,
    width: "130%",
    height: 200,
    // marginLeft:50
    resizeMode: "contain",
  },
});

export default Home;
