import React, { useEffect, useState } from "react";
import { styles } from "./Signup";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  PermissionsAndroid,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import Colors from "../assets/Colors";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getCurrentUser,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import app from "../firebase/config";
import * as Permissions from "expo-permissions";
import { useToast } from "native-base";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import * as DocumentPicker from "expo-document-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../AuthContextApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
const RegisterBakerySchema = yup.object({
  ownername: yup.string().required("Owner's Name is required"),
  bakeryname: yup.string().required("Bakery Name is required"),
  speciality: yup.string().required("Speciality is required"),
  contactNumber: yup
    .string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .required("Contact Number is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  timing: yup.string().required("Timing is required"),
  pricePerPound: yup
    .string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .required("Price per Pound is required"),
  priceForDecoration: yup
    .string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .required("Decoration Price is required"),
  priceForTiers: yup
    .string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .required("Price for Tiers is required"),
  priceForShape: yup
    .string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .required("Price for Shape is required"),
  tax: yup
    .string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .required("Tax is required"),
  city: yup.string().required("city is required"),
  country: yup.string().required("Country is required"),
  street: yup.string().required("street is required"),
  latitude: yup.string().required("latitude is required"),
  longitude: yup.string().required("longitude is required"),
});

const RegisterBakery = () => {
  const { user, updateUserInContext } = useAuth();
  const [location, setLocation] = useState(null);
  const toast = useToast();
  const storage = getStorage(app);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const db = getFirestore(app);
  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const registerBakeryHandle = async (values) => {
    setLoading(true);
    if (!selectedImage) {
      toast.show({
        title: "Please select an image.",
        status: "error",
        placement: "top",
        duration: 3000,
        style: { top: "5%", backgroundColor: "#e74c3c" },
      });
      setLoading(false);
    } else {
      try {
        const timestamp = new Date().getTime();
        const fileExtension = selectedImage.split(".").pop().toLowerCase();
        const fileName = `bakery_image_${timestamp}.${fileExtension}`;
        const storageRef = ref(storage, `bakery_images/${fileName}`);
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        const userDocRef = doc(collection(db, "users"), user.uid);
        updateDoc(userDocRef, {
          isBakeryRegistered: true,
        });

        // Create a bakery subcollection
        const bakeryCollectionRef = collection(db, "bakeries");
        const bakeryDoc = doc(bakeryCollectionRef, user.uid);
        await setDoc(bakeryDoc, {
          image: downloadURL,
          ownername: values.ownername,
          bakeryname: values.bakeryname,
          speciality: values.speciality,
          contactNumber: values.contactNumber,
          email: values.email,
          timing: values.timing,
          pricePerPound: values.pricePerPound,
          priceForDecoration: values.priceForDecoration,
          priceForTiers: values.priceForTiers,
          priceForShape: values.priceForShape,
          tax: values.tax,
          city: values.city,
          country: values.country,
          street: values.street,
          latitude: values.latitude,
          longitude: values.longitude,
          bakeryId: user.uid,
        });

        AsyncStorage.getItem("user").then((userData) => {
          const userinfo = JSON.parse(userData);

          const UpdatedUser = {
            ...userinfo,
            isBakeryRegistered: true,
          };
          AsyncStorage.setItem("user", JSON.stringify(UpdatedUser));
          updateUserInContext({ ...user, isBakeryRegistered: true });
        });

        setLoading(false);

        toast.show({
          title: "Bakery registered successfully",
          status: "success",
          placement: "top",
          duration: 3000,
          style: { top: "5%", backgroundColor: "#2ecc71" },
        });
      } catch (error) {
        setLoading(false);
        toast.show({
          title: "Failed to register bakery",
          description: error.message || "An error occurred.",
          status: "error",
          placement: "top",
          duration: 3000,
          style: { top: "5%", backgroundColor: "#e74c3c" },
        });
      }
    }
  };

  const locationHandle = async (setValues, values) => {
    setLoadingLocation(true);
  
    let isLocationEnabled = await Location.hasServicesEnabledAsync();
  
    if (!isLocationEnabled) {
      setLoadingLocation(false);
      Linking.openSettings();
    } else {
      let { status } = await Location.requestForegroundPermissionsAsync();
  
      if (status !== 'granted') {
        console.error('LOCATION_FOREGROUND permission not granted');
        setLoadingLocation(false);
        return;
      }
  
      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
  
        // Update Formik values with location data
        setValues({
          ...values,
          latitude: String(currentLocation.coords.latitude),
          longitude: String(currentLocation.coords.longitude),
          city: reverseGeocode[0]?.city || '',
          country: reverseGeocode[0]?.country || '',
          street: reverseGeocode[0]?.street || '',
        });
  console.log(values);
        setLoadingLocation(false);
      } catch (error) {
        console.error('Error getting location:', error);
        setLoadingLocation(false);
      }
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.20)", "rgba(0, 0, 0, 0.10)"]}
        style={[StyleSheet.absoluteFill]}
      />
      <LinearGradient
        colors={["rgba(193, 123, 41, 0.94)", "rgba(193, 123, 41, 0.09)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Formik
            initialValues={{
              ownername: "",
              bakeryname: "",
              speciality: "",
              contactNumber: "",
              email: "",
              timing: "",
              pricePerPound: "",
              priceForDecoration: "",
              priceForTiers: "",
              priceForShape: "",
              tax: "",
              bakeryImage: null,
              city: "",
              country: "",
              street: "",
              longitude: "",
              latitude: "",
            }}
            validationSchema={RegisterBakerySchema}
            onSubmit={(values, { resetForm }) => {
              registerBakeryHandle(values);
              resetForm();
            }}
          >
            {({
             handleChange, handleBlur, handleSubmit, setValues, values, errors, touched
            }) => (
              <View style={styles.formContainer}>
                {/* Bakery Information */}

                <Text
                  style={{
                    color: "white",
                    fontSize: 45,
                    fontWeight: "bold",
                    paddingTop: 25,
                    marginLeft: 20,
                    alignSelf: "flex-start",
                  }}
                >
                  Register Your Bakery
                </Text>
                <Text
                  style={{ padding: 20, paddingTop: 10, color: Colors.grey }}
                >
                  Best way to earn many. Just few clicks and start earning with
                  your own business. Register bakery Now
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Owner's Name"
                  onChangeText={handleChange("ownername")}
                  onBlur={handleBlur("ownername")}
                  value={values.ownername}
                />
                <Text style={styles.errorText}>
                  {touched.ownername && errors.ownername}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Bakery Name"
                  onChangeText={handleChange("bakeryname")}
                  onBlur={handleBlur("bakeryname")}
                  value={values.bakeryname}
                />
                <Text style={styles.errorText}>
                  {touched.bakeryname && errors.bakeryname}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Speciality"
                  onChangeText={handleChange("speciality")}
                  onBlur={handleBlur("speciality")}
                  value={values.speciality}
                />
                <Text style={styles.errorText}>
                  {touched.speciality && errors.speciality}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Contact Number"
                  onChangeText={handleChange("contactNumber")}
                  onBlur={handleBlur("contactNumber")}
                  value={values.contactNumber}
                  keyboardType="numeric"
                />
                <Text style={styles.errorText}>
                  {touched.contactNumber && errors.contactNumber}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                />
                <Text style={styles.errorText}>
                  {touched.email && errors.email}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Timing"
                  onChangeText={handleChange("timing")}
                  onBlur={handleBlur("timing")}
                  value={values.timing}
                />
                <Text style={styles.errorText}>
                  {touched.timing && errors.timing}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginHorizontal: 50,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: Colors.primaryColor,
                      padding: 10,
                      borderRadius: 10,
                      shadowOffset: 4,
                      shadowRadius: 4,
                      shadowColor: "white",
                      shadowOpacity: 1,
                      marginRight: 70,
                    }}
                    onPress={handleImagePicker}
                  >
                    <Text style={styles.regButtonText}>Upload Image</Text>
                  </TouchableOpacity>
                  {selectedImage ? (
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.image}
                    />
                  ) : (
                    <Image
                      source={require("../assets/empty-image.png")}
                      style={styles.image}
                    />
                  )}
                </View>

                {/* location information */}
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "black",
                    marginVertical: 10,
                  }}
                >
                  Location Information
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primaryColor,
                    padding: 10,
                    borderRadius: 10,
                    shadowColor: "white",
                    shadowOffset: 4,
                    shadowRadius: 4,
                    shadowOpacity: 1,
                    width: "90%",
                  }}
                  onPress={() => locationHandle(setValues, values)}
                  disabled={loadingLocation} // Disable the button when loading
                >
                  {loadingLocation ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.regButtonText}>
                      <Icon name="location-arrow" size={20} />
                      Share Your Current Location
                    </Text>
                  )}
                </TouchableOpacity>

                <Text
                  style={{
                    margin: 15,
                    fontSize: 25,
                    color: "red",
                    fontWeight: "bold",
                  }}
                >
                  OR
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={values.city}
                  onChangeText={handleChange("city")}
                  onBlur={handleBlur("city")}
                />

                <Text style={styles.errorText}>
                  {touched.city && errors.city}
                </Text>

                <View style={styles.rowContainer}>
                  <View style={styles.halfInputContainer}>
                    <TextInput
                      style={styles.halfInput}
                      placeholder="Country"
                      value={values.country}
                      onChangeText={handleChange("country")}
                      onBlur={handleBlur("country")}
                    />
                    <Text style={[styles.errorText, { marginLeft: 0 }]}>
                      {touched.country && errors.country}
                    </Text>
                  </View>
                  <View style={styles.halfInputContainer}>
                    <TextInput
                      style={styles.halfInput}
                      placeholder="Street"
                      value={values.street}
                      onChangeText={handleChange("street")}
                      onBlur={handleBlur("street")}
                    />
                    <Text style={[styles.errorText, { marginLeft: 0 }]}>
                      {touched.street && errors.street}
                    </Text>
                  </View>
                </View>
                <View style={styles.rowContainer}>
                  <View style={styles.halfInputContainer}>
                    <TextInput
                      style={styles.halfInput}
                      placeholder="Longitude"
                      value={values.longitude}
                      onChangeText={handleChange("longitude")}
                      onBlur={handleBlur("longitude")}
                    />
                    <Text style={[styles.errorText, { marginLeft: 0 }]}>
                      {touched.longitude && errors.longitude}
                    </Text>
                  </View>
                  <View style={styles.halfInputContainer}>
                    <TextInput
                      style={styles.halfInput}
                      placeholder="Latitude"
                      value={values.latitude}
                      onChangeText={handleChange("latitude")}
                      onBlur={handleBlur("latitude")}
                    />
                    <Text style={[styles.errorText, { marginLeft: 0 }]}>
                      {touched.latitude && errors.latitude}
                    </Text>
                  </View>
                </View>

                {/* Customize Cake Info */}
                <Text
                  style={{ fontSize: 24, fontWeight: "bold", color: "black" }}
                >
                  Customize Cake Info
                </Text>
                <View style={styles.rowContainer}>
                  <View style={styles.halfInputContainer}>
                    <TextInput
                      style={styles.halfInput}
                      placeholder="Price per Pound"
                      onChangeText={handleChange("pricePerPound")}
                      onBlur={handleBlur("pricePerPound")}
                      value={values.pricePerPound}
                      keyboardType="numeric"
                    />
                    <Text style={[styles.errorText, { marginLeft: 0 }]}>
                      {touched.pricePerPound && errors.pricePerPound}
                    </Text>
                  </View>
                  <View style={styles.halfInputContainer}>
                    <TextInput
                      style={styles.halfInput}
                      placeholder="Price for Decoration"
                      onChangeText={handleChange("priceForDecoration")}
                      onBlur={handleBlur("priceForDecoration")}
                      value={values.priceForDecoration}
                      keyboardType="numeric"
                    />
                    <Text style={[styles.errorText, { marginLeft: 0 }]}>
                      {touched.priceForDecoration && errors.priceForDecoration}
                    </Text>
                  </View>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Price for Tiers"
                  onChangeText={handleChange("priceForTiers")}
                  onBlur={handleBlur("priceForTiers")}
                  value={values.priceForTiers}
                  keyboardType="numeric"
                />
                <Text style={styles.errorText}>
                  {touched.priceForTiers && errors.priceForTiers}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Price for Shape"
                  onChangeText={handleChange("priceForShape")}
                  onBlur={handleBlur("priceForShape")}
                  value={values.priceForShape}
                  keyboardType="numeric"
                />
                <Text style={styles.errorText}>
                  {touched.priceForShape && errors.priceForShape}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Tax"
                  onChangeText={handleChange("tax")}
                  onBlur={handleBlur("tax")}
                  value={values.tax}
                  keyboardType="numeric"
                />
                <Text style={styles.errorText}>
                  {touched.tax && errors.tax}
                </Text>

                <TouchableOpacity
                  style={styles.regButton}
                  onPress={handleSubmit}
                >
                  {loading ? (
                    <ActivityIndicator
                      size="small"
                      color={Colors.secondaryColor}
                    />
                  ) : (
                    <Text style={styles.regButtonText}>Register Bakery</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterBakery;
