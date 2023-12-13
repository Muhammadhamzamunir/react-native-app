import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
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
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { SelectList } from "react-native-dropdown-select-list";
import app from "../firebase/config";
import { useAuth } from "../AuthContextApi";
import { useToast, NativeBaseProvider } from "native-base";
import { getDatabase, ref, set } from "firebase/database";
import uuid from "react-native-uuid";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import Modal from "react-native-modal";
const ProductSchema = yup.object({
  productName: yup.string().required("Product Name is required"),
  price: yup
    .number()
    .required("Price is required")
    .positive("Price must be positive"),
  description: yup.string().required("Description is required"),
  numberOfItems: yup
    .number()
    .required("Number of Items is required")
    .integer("Number of Items must be an integer")
    .positive("Number of Items must be positive"),
  category: yup.string().required("Category is required"),
});

const RegisterProduct = ({ route }) => {
  const { bakeryId } = route.params;

  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const db = getDatabase(app);
  const storage = getStorage();
  const toast = useToast();
  const { user, updateUserInContext } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

   

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
    toggleModal();
  };
  

 
  const handleOpenCamera = async () => {
   if(!hasCameraPermission){
    const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
      handleOpenCamera();
   }
    if (hasCameraPermission) {
      let photo = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!photo.cancelled) {
        setSelectedImage(photo.assets[0].uri);
        toggleModal()
      }
    } else {
      
      
      
    }
  };

  const registerProductHandle = async (values, { resetForm }) => {
    try {
      setLoading(true);

      if (!selectedImage) {
        toast.show({
          title: "Upload Image",
          status: "error",
          placement: "top",
          duration: 3000,
          style: { top: "5%", backgroundColor: "#e74c3c" },
        });
        setLoading(false);
        return;
      }

      const timestamp = new Date().getTime();
      const fileExtension = selectedImage.split(".").pop().toLowerCase();
      const fileName = `product_image_${timestamp}.${fileExtension}`;

      const storageRef = sRef(storage, `product_images/${fileName}`);
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      set(ref(db, "products/" + uuid.v4()), {
        image: downloadURL,
        productName: values.productName,
        description: values.description,
        price: values.price,
        numberOfItems: values.numberOfItems,
        category: values.category,
        averageRating: 4.5,
        createdAt: serverTimestamp(),
        bakeryID: user.uid,
      });

      setLoading(false);
      resetForm();
      toast.show({
        title: "Product registered successfully",
        status: "success",
        placement: "top",
        duration: 3000,
        style: { top: "5%", backgroundColor: "#2ecc71" },
      });
    } catch (error) {
      console.error("Error in registerProductHandle:", error);
      setLoading(false);
      toast.show({
        title: error,
        status: "error",
        placement: "top",
        duration: 3000,
        style: { top: "5%", backgroundColor: "#e74c3c" },
      });
      console.error("Failed to register product");
    }
  };

  const cakeCategories = [
    "chocolate cake",
    "cheese cake",
    "birthday cake",
    "vanilla cake",
    "fruit Cake",
    "party",
    "party products",
    "other"
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
      <View style={styles.container}>
        <Text
          style={{
            color: "white",
            fontSize: 45,
            fontWeight: "bold",
            paddingTop: 25,
            marginLeft: 10,
            alignSelf: "flex-start",
          }}
        >
          Add Product and Earn Money
        </Text>

        <Text style={{ padding: 20, paddingTop: 10, color: Colors.grey }}>
          Provide the details of your product to start selling
        </Text>
        <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "black",
                    marginVertical: 10,
                    textAlign:"center"
                  }}
                >
                  Product Details
                </Text>
        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={toggleModal}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
            />
          ) : (
            <Image
              source={require("../assets/empty-image.png")}
              style={styles.emptyImage}
            />
          )}
          <Text style={styles.imagePickerText}>Pick an image</Text>
        </TouchableOpacity>

        <Formik
          initialValues={{
            productName: "",
            price: "",
            numberOfItems: "",
            category: "",
            description: "",
          }}
          validationSchema={ProductSchema}
          onSubmit={registerProductHandle}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <TextInput
                placeholder="Product Name"
                style={styles.input}
                onChangeText={handleChange("productName")}
                onBlur={handleBlur("productName")}
                value={values.productName}
              />
              {touched.productName && errors.productName && (
                <Text style={styles.errorText}>{errors.productName}</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Price"
                onChangeText={handleChange("price")}
                onBlur={handleBlur("price")}
                value={values.price}
                keyboardType="numeric"
              />
              {touched.price && errors.price && (
                <Text style={styles.errorText}>{errors.price}</Text>
              )}

              <TextInput
                placeholder="Number of Items"
                style={styles.input}
                onChangeText={handleChange("numberOfItems")}
                onBlur={handleBlur("numberOfItems")}
                value={values.numberOfItems}
                keyboardType="numeric"
              />
              {touched.numberOfItems && errors.numberOfItems && (
                <Text style={styles.errorText}>{errors.numberOfItems}</Text>
              )}

              <SelectList
                setSelected={(val) => handleChange("category")(val)}
                data={cakeCategories.map((category) => ({
                  value: category,
                }))}
                save="value" 
                placeholder="Select Category"
                boxStyles={{ backgroundColor: "white", color: "red", borderColor:"white" }}
               dropdownStyles={{ backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#ccc" }} 
               dropdownItemStyles={{borderBottomWidth: 1, padding:20,borderTopColor: "lightgrey"}} 
               placeholderTextColor="#ccc" 
              />
              {touched.category && errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}

              <TextInput
                placeholder="Description"
                style={styles.textArea}
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
                value={values.description}
                multiline
              />
              {touched.description && errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.secondaryColor}
                  />
                ) : (
                  <Text style={styles.buttonText}>Register Product</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
      {/* ------------------------------Modal Start---------------------------------------------------------------- */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={{
          width: "100%",
          marginLeft: 0,
          marginBottom: 0,
        }}
      >
        <View style={[styles.modalContainer, { height: 200 }]}>
          <View style={{ alignItems: "flex-end", width: "100%" }}>
            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginRight: 10 }}
              onPress={toggleModal}
            >
              <Icon name="times" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: 50,
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{ justifyContent: "center", alignItems: "center" }}
              onPress={handleOpenCamera}
            >
              <Icon name="camera" size={40} color={Colors.primaryColor} />
              <Text
                style={{
                  color: Colors.primaryColor,
                  fontSize: 20,
                  fontWeight: 600,marginTop:7
                }}
              >
                Open Camera
              </Text>
            </TouchableOpacity>

            
            <TouchableOpacity
              style={{ justifyContent: "center", alignItems: "center" }}
              onPress={handleImagePicker}
            >
              <Icon name="image" size={40} color={Colors.primaryColor} />
              <Text
                style={{
                  color: Colors.primaryColor,
                  fontSize: 20,
                  fontWeight: 600,
                  marginTop:7
                }}
              >
                Open Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ----------------------------Modal End--------------------------------------------------------------------------*/}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // backgroundColor:"red"
    paddingBottom:50
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 10,
    borderTopEndRadius: 20,
    borderTopLeftRadius: 20,

    position: "absolute",
    bottom: 0,
    width: "100%",
    left: 0,
    right: 0,
    flex: 1,
    justifyContent: "flex-start",
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: "rgba(0, 0, 0, 0.10)",
    // opacity:0.5,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  imagePickerText: {
    color: Colors.secondaryColor,
    fontSize: 16,
    marginTop: 5,
    fontWeight: "bold",
  },
  selectedImage: {
    width: 200,
    height: 200,
  },

  input: {
    height: 45,
    width: "100%",
    padding: 10,
    borderRadius: 10,
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 20,
    backgroundColor: "white",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
  },
  inputContainer: {
    height: 45,
    width: "100%",
    borderRadius: 10,
    borderColor: Colors.primaryColor,
    borderWidth: 1,
    marginBottom: 10,
  },
  dropdownItem: {
    justifyContent: "flex-start",
  },
  dropdownLabel: {
    fontSize: 16,
    color: Colors.primaryColor,
  },
  textArea: {
    height: 250,
    width: "100%",
    padding: 10,
    borderRadius: 10,
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: "white",
    marginTop: 10,
  },
  registerButton: {
    backgroundColor: Colors.primaryColor,
    width: "100%",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    color: Colors.secondaryColor,
  },
});

export default RegisterProduct;
