import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Colors from "../assets/Colors";
import Icon from "react-native-vector-icons/FontAwesome";
import app from "../firebase/config";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  where,
  getDocs,
} from "firebase/firestore";
import {
  getDatabase,
  ref,
  query as rtQuery,
  orderByChild as rtOrderByChild,
  equalTo as rtEqualTo,
  onValue,
  orderByChild,
  startAt,
  endAt,
} from "firebase/database";

const bakeryData = ["Kira", "Layers"];

const SearchBarDropdownInline = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Bakery");
  const [filteredBakeries, setFilteredBakeries] = useState(bakeryData);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigation = useNavigation();

  const handleSearch = (text) => {
    setSearchQuery(text);
    setFilteredBakeries(
      bakeryData.filter((bakery) => {
        if (selectedFilter === "Bakery") {
          return bakery.toLowerCase().includes(text.toLowerCase());
        } else {
          return true;
        }
      })
    );
    if (text.trim() === "") {
      setShowSearchDropdown(false);
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    toggleFilterDropdown();
  };

  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  const toggleSearchDropdown = () => {
    setShowSearchDropdown(!showSearchDropdown);
  };

  const handleSearchSubmit = async () => {
    setShowSearchDropdown(true);
    setLoading(true);
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setLoading(false);
      setShowSearchDropdown(false);
      return;
    }

    console.log("Search Text:", searchQuery);
    console.log("Selected Filter:", selectedFilter);

    if (selectedFilter === "Bakery") {
      const db = getFirestore(app);
      const bakeriesRef = collection(db, "bakeries");

      try {
        const querySnapshot = await getDocs(
          query(
            bakeriesRef,
            orderBy("bakeryname"),
            where("bakeryname", ">=", searchQuery.toLowerCase()),
            where("bakeryname", "<=", searchQuery.toLowerCase() + "\uf8ff")
          )
        );

        const bakeryArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Bakery Array:", bakeryArray);
        setSearchResults(bakeryArray);
      } catch (error) {
        console.error("Error fetching bakeries:", error);
      } finally {
        setLoading(false);
        setShowSearchDropdown(true);
      }
    } else {
      const db = getDatabase(app);
      const cakeRef = ref(db, "products");

      try {
        let queryResult;
        if (selectedFilter === "Cake Name") {
          queryResult = rtQuery(
            cakeRef,
            rtOrderByChild("productName"),
            startAt(searchQuery.toLowerCase()),
            endAt(searchQuery.toLowerCase() + "\uf8ff")
          );
        } else if (selectedFilter === "Cake Category") {
          queryResult = rtQuery(
            cakeRef,
            rtOrderByChild("category"),
            startAt(searchQuery.toLowerCase()),
            endAt(searchQuery.toLowerCase() + "\uf8ff")
          );
        }

        console.log(queryResult);
        onValue(queryResult, (snapshot) => {
          const data = snapshot.val();
          const resultArray = data ? Object.values(data) : [];
          console.log(resultArray);
          setSearchResults(resultArray);
        });
      } catch (error) {
        console.error("Error querying products:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderFilterDropdownContent = () => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity onPress={() => handleFilterChange("Bakery")}>
        <Text style={styles.dropdownItem}>Bakery</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleFilterChange("Cake Name")}>
        <Text style={styles.dropdownItem}>Cake Name</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleFilterChange("Cake Category")}>
        <Text style={styles.dropdownItem}>Cake Category</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchDropdownContent = () => (
    <View style={styles.searchDropdownContainer}>
      {loading && (
        <ActivityIndicator size="small" color={Colors.primaryColor} />
      )}
      {!loading && searchResults.length === 0 && (
        <Text style={styles.dropdownItem}>No results found</Text>
      )}
      {!loading &&
        searchResults.map((result) => (
          <TouchableOpacity
            key={result.id}
            style={styles.searchResultItem}
            onPress={() => handleResultSelection(result)}
          >
            <Image source={{ uri: result.image }} style={styles.resultImage} />
            <Text style={styles.resultText}>
              {result.bakeryname ? result.bakeryname : result.productName}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  );

  const renderBakeryItem = ({ item, index }) => {
    // Implement your rendering logic for bakery items here
    // You can use TouchableOpacity, Text, Image, or any other components
  };

  const handleResultSelection = (result) => {
    
    console.log("Selected Result:", result);
   if(result.productName){
    navigation.navigate("CakeDetailPage", { item: result });
   }else{
     navigation.navigate('BakeryDetail', {bakery:result })

   }


   

  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Search By ${selectedFilter}`}
          placeholderTextColor="#7C7C7C"
          onChangeText={handleSearch}
          value={searchQuery}
        />
        <TouchableOpacity
          // style={styles.dropdownButton}
          onPress={toggleFilterDropdown}
        >
          <View style={styles.dropdownButton}>
            <Text style={{ color: "white", textAlign: "center" }}>
              {"\u25BC"}
            </Text>
            
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleSearchSubmit}
      >
        <Icon name="search" size={20} color={"white"} />
      </TouchableOpacity>
      {showFilterDropdown && renderFilterDropdownContent()}
      {showSearchDropdown &&
        searchQuery.trim() !== "" &&
        renderSearchDropdownContent()}
      <FlatList
        data={filteredBakeries}
        keyExtractor={(bakery) => bakery.id}
        renderItem={renderBakeryItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    // margin: 10,
  },
  searchContainer: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 3,
    marginLeft: 13,
    width: "80%",
    backgroundColor: "#E3E3E3",
  },
  input: {
    flex: 1,
    padding: 10,
  },
  dropdownButton: {
    backgroundColor: Colors.primaryColor,
    width: 27,
    padding:5,
    borderRadius: 50,
    margin:5,
    alignItems:"center"
  },
  dropdownContainer: {
    position: "absolute",
    top: 50,
    width: "30%",
    right: 50,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    zIndex: 1,
  },
  searchDropdownContainer: {
    position: "absolute",
    top: 50,
    width: "100%",
    right: 0,
    backgroundColor: "lightgrey",
    borderWidth: 10,
    borderColor: "#ccc",
    borderRadius: 5,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 10,
    borderBottomColor: "white",
  },
  searchButton: {
    backgroundColor: Colors.primaryColor,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft:8
  },
  resultImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  resultText: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default SearchBarDropdownInline;
