import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  // SafeAreaView,
  TouchableOpacity,
  Button,
  Image,
} from "react-native";
import Colors from "../assets/Colors";
import Icon from "react-native-vector-icons/FontAwesome";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./Signup";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "../firebase/config";
import { useAuth } from "../AuthContextApi";
import { SafeAreaView } from "react-native-safe-area-context";
const Account = () => {
  const { user, updateUserInContext } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const auth = getAuth(app);
  const navigation = useNavigation();
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    // <SafeAreaView>
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}></View>
      {!user ? (
        <View style={styles.registrationContainer}>
          <Text style={styles.registrationText}>Are You Ready To Join Us?</Text>
          <TouchableOpacity style={[styles.regButton,{backgroundColor:"#f2f2f2", shadowColor:Colors.secondaryColor,shadowOpacity:0.8,shadowOffset:1,shadowRadius:15}]} onPress={toggleModal}>
            <Text
              style={{
                textAlign: "center",
                fontSize: 17,
                color: "black",
              }}
            >
              Login OR SignUp
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={customCSS.userProfileContainer}>
          <View>
            <Image
               source={{ uri: user.image || 'https://via.placeholder.com/70' }}
              style={customCSS.profileImage}
            />
          </View>
          <View style={customCSS.profileDetailContainer}>
            <Text
              style={[customCSS.profiletext, { fontSize: 20, fontWeight: 700 }]}
            >
              {user.username}
            </Text>
            <Text style={customCSS.profiletext}>{user.email}</Text>
            <Text style={customCSS.profiletext}>
              {user.phone ? user.phone : "+92------------"}
            </Text>
            <Text style={customCSS.profiletext}>
              {user.address ? user.address : "Address Not Specified"}
            </Text>
          </View>
        </View>
      )}

      {/* ------------------------------Modal Start---------------------------------------------------------------- */}
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
            <Icon name="times" size={20} color="black" />
          </TouchableOpacity>
          <Image
            source={require("../assets/modalCartoon.gif")}
            style={styles.modalImage}
          />

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setModalVisible(!isModalVisible);
              navigation.removeListener;
              navigation.navigate("Login");
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                color: Colors.primaryColor,
              }}
            >
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.regButton}
            onPress={() => {
              setModalVisible(!isModalVisible);

              navigation.navigate("Signup");
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                color: Colors.secondaryColor,
              }}
            >
              Create New Account
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              textAlign: "center",
              padding: 5,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            OR
          </Text>
          <TouchableOpacity>
            <View style={styles.googleButton}>
              <Image
                source={require("../assets/google.png")}
                style={styles.googleLogo}
              />
              <Text style={styles.buttonText}>Sign In with Google</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* ----------------------------Modal End--------------------------------------------------------------------------*/}
    </SafeAreaView>
    // </SafeAreaView>
  );
};

export default Account;
const customCSS = StyleSheet.create({
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  userProfileContainer: {
    backgroundColor: Colors.primaryColor,
    margin: 15,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    // alignItems:"center",
  },
  profileDetailContainer: {
    paddingHorizontal: 20,
  },
  profiletext: {
    color: "white",
    marginBottom: 5,
    fontSize: 15,
  },
});
