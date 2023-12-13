import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Colors from "../assets/Colors";
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

const BakeryDetailed = ({ route }) => {
  const { bakery } = route.params;
  console.log(bakery.bakeryId);
  const [imageLoading, setImageLoading] = useState(true);
  const [products , setProducts ] = useState();
  useEffect(() => {
    const db = getDatabase(app);
    const bakeryProductsRef = ref(db, "products");
    const bakeryProductsQuery = query(
      bakeryProductsRef,
      orderByChild("bakeryID"),
      equalTo(bakery.bakeryId)
    );
    onValue(bakeryProductsQuery,(snapshot)=>{
      const productsArray =[]
      const data = snapshot.val();
      if (data) {
        Object.values(data).forEach((product) => {
         
            productsArray.push(product);
          
        });
      }
      setProducts(productsArray)
    })
    // console.log(bakeryProducts);
  }, []);
  return (
    <ScrollView style={styles.container}>
      {imageLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={Colors.primaryColor}
            style={{ marginTop: 40 }}
          />
        </View>
      )}
      <Image
        source={{ uri: bakery.image }}
        style={styles.bakeryImage}
        onLoad={() => setImageLoading(false)}
        onLoadEnd={() => setImageLoading(false)}
      />

      <View style={styles.detailsContainer}>
        <Text style={styles.bakeryName}>{bakery.bakeryname}</Text>
        <Text style={styles.ownerName}>{`By ${bakery.ownername}`}</Text>
        <Text style={styles.timing}>{`Opening Hours: ${bakery.timing}`}</Text>
        <View style={styles.separator} />

        <Text style={styles.sectionHeading}>About Us</Text>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Specialty:</Text>
          <Text style={styles.detailText}>{bakery.speciality}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Price Per Pound:</Text>
          <Text style={styles.detailText}>{bakery.pricePerPound}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Price For Decoration:</Text>
          <Text style={styles.detailText}>{bakery.priceForDecoration}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Price For Shape:</Text>
          <Text style={styles.detailText}>{bakery.priceForShape}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Price For Tiers:</Text>
          <Text style={styles.detailText}>{bakery.priceForTiers}</Text>
        </View>
        <View style={styles.separator} />
        <Text style={styles.sectionHeading}>Address </Text>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailText}>{bakery.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Zip Code:</Text>
          <Text style={styles.detailText}>{bakery.zipCode}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Country:</Text>
          <Text style={styles.detailText}>{bakery.country}</Text>
        </View>
        <View style={styles.separator} />
        <Text style={styles.sectionHeading}>Contact Us</Text>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Contact Number:</Text>
          <Text style={styles.detailText}>{bakery.contactNumber}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailText}>{bakery.email}</Text>
        </View>
      </View>
      <View style={styles.separator} />
      <View style={{padding:20}}>
      <Text style={styles.sectionHeading}>Products</Text>
      <CakeCard data={products}/>
      
     

      </View>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bakeryImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  detailsContainer: {
    padding: 20,
  },
  bakeryName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primaryColor,
    marginBottom: 5,
  },
  ownerName: {
    fontSize: 18,
    color: Colors.secondaryColor,
    marginBottom: 10,
  },
  timing: {
    fontSize: 16,
    color: Colors.darkGray,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 15,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primaryColor,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.darkGray,
  },
  detailText: {
    fontSize: 16,
    color: Colors.mediumGray,
  },
});

export default BakeryDetailed;
