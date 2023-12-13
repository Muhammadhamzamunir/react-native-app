import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Button,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  // SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import Colors from "../assets/Colors";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import app from "../firebase/config";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useToast, NativeBaseProvider, Center } from "native-base";
import { SafeAreaView } from "react-native-safe-area-context";
const SignupSchema = yup.object({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  phoneNumber: yup
    .string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .required("Phone number is required"),
});

const Signup = () => {
  const navigation = useNavigation();
  const auth = getAuth(app);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Formik
            initialValues={{
              username: "",
              email: "",
              password: "",
              confirmPassword: "",
              phoneNumber: "",
            }}
            validationSchema={SignupSchema}
            onSubmit={(values, { resetForm }) => {
              setLoading(true);
              createUserWithEmailAndPassword(
                auth,
                values.email,
                values.password
              )
                .then((userCredential) => {
                  const createdUser = userCredential.user;
                  const db = getFirestore(app);
                  const usersCollection = collection(db, "users");
                  const userDocRef = doc(usersCollection, createdUser.uid);
                  setDoc(userDocRef, {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    phone: values.phoneNumber,
                    isBakeryRegistered: false,
                    image:
                      "https://firebasestorage.googleapis.com/v0/b/semester-project-10ee1.appspot.com/o/userProfile%2Fpngfind.com-placeholder-png-6104451.png?alt=media&token=4fa5e472-14a6-441d-9ccf-843f3f2984f3",
                  });
                  setLoading(false);
                  toast.show({
                    title: "User created successfully",
                    status: "success",
                    placement: "top",
                    duration: 3000,
                    style: { top: "5%", backgroundColor: "#2ecc71" },
                  });
                  resetForm();
                  navigation.navigate("Login");
                })
                .catch((error) => {
                  setLoading(false);
                  let errorMessage = "An error occurred. Please try again.";

                  switch (error.code) {
                    case "auth/invalid-email":
                      errorMessage = "Invalid email address.";
                      break;
                    case "auth/email-already-in-use":
                      errorMessage = "Email address is already in use.";
                      break;
                    case "auth/weak-password":
                      errorMessage =
                        "Password is too weak. Please choose a stronger password.";
                      break;

                    default:
                      break;
                  }

                  toast.show({
                    title: errorMessage,
                    status: "error",
                    placement: "top",
                    duration: 3000,
                    style: { top: "5%", backgroundColor: "#e74c3c" },
                  });
                });
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldTouched,
            }) => (
              <View style={styles.formContainer}>
                <View style={styles.imageContainer}>
                  <Image
                    source={require("../assets/splash.png")}
                    style={styles.image}
                  />
                </View>
                <Text style={styles.title}>Register</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  onChangeText={handleChange("username")}
                  onBlur={handleBlur("username")}
                  value={values.username}
                />
                {touched.username && errors.username &&(
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                />
                {touched.email && errors.email &&(
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                />
                {touched.password && errors.password &&(
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  secureTextEntry
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                />
                {touched.confirmPassword && errors.confirmPassword &&(
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  onChangeText={handleChange("phoneNumber")}
                  onBlur={handleBlur("phoneNumber")}
                  value={values.phoneNumber}
                  keyboardType="numeric"
                />
                {touched.phoneNumber && errors.phoneNumber &&(
                  <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                )}
                <Text
                  style={{
                    color: "grey",
                    paddingHorizontal: 17,
                    marginBottom: 15,
                  }}
                >
                  By clicking “Create Account”, I agree to SpechSlice's Terms of
                  Use and Privacy Policy
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
                    <Text style={styles.regButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View style={styles.rowContainer}>
            <Text style={styles.accountText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    // backgroundColor:"red"
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 16,
    paddingTop: 0,
  },
  imageContainer: {
    height: 340,
    backgroundColor: Colors.primaryColor,
    width: "100%",

    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 30,
  },
  input: {
    height: 45,
    width: "90%",
    padding: 10,
    borderRadius: 10,
    borderColor: "#F2F2F2",
    borderWidth: 1,
    backgroundColor: "white",
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    // marginTop: 5,
    alignSelf: "flex-start",
    marginLeft: 30,
    fontSize: 12,
  },
  image: {
    width: 300,
    height: 200,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    //  textAlign:"left",
    // color: Colors.primaryColor,
    marginBottom: 20,
    marginTop: 25,
    alignSelf: "flex-start",
    marginLeft: 25,
  },
  regButton: {
    backgroundColor: Colors.primaryColor,
    width: "90%",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  regButtonText: {
    fontSize: 20,
    color: Colors.secondaryColor,
    textAlign: "center",
  },
  rowContainer: {
    flexDirection: "row",
    margin: 5,
    alignSelf: "center",
    paddingHorizontal: 10,
  },
  accountText: {
    fontSize: 16,
  },
  loginText: {
    color: Colors.primaryColor,
    fontSize: 16,
    marginLeft: 5,
    textAlign: "center",
  },
  container: {
    flex: 1,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 10,
    margin: 5,
  },
  registrationContainer: {
    backgroundColor: Colors.primaryColor,
    justifyContent: "center",
    alignItems: "center",
    margin: 15,
    borderRadius: 20,
    padding: 20,
  },
  registrationText: {
    fontSize: 27,
    fontWeight: "bold",
    marginBottom: 16,
    color: "white",
  },
  regButton: {
    backgroundColor: Colors.primaryColor,
    textAlign: "center",
    width: "90%",
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: Colors.primaryColor,
  },
  modalButton: {
    backgroundColor: "white",
    textAlign: "center",
    width: "90%",
    padding: 10,
    borderRadius: 3,
    marginVertical: 8,
    alignSelf: "center",
    borderColor: Colors.primaryColor,
    borderWidth: 2,
    borderRadius: 10,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 10,
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

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "black",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  halfInputContainer: {
    flex: 1,
    width: "48%",
    marginRight: "2%",
    flexDirection: "column",
  },
  halfInput: {
    height: 45,
    paddingHorizontal: 10,
    borderRadius: 10,
    // borderColor: "white",
    // borderWidth: 1,
    // marginBottom: 10,
    backgroundColor: "white",
  },
  image: {
    width: 150,
    height: 100,
    // marginTop: 20,
  },imagePickerButton: {
    backgroundColor: Colors.secondaryColor,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  imagePickerText: {
    color: Colors.primaryColor,
    fontSize: 16,
    marginTop: 5,fontWeight:"bold"
  },
  selectedImage: {
    width: 200,
    height: 200,
   
  },
});

export default Signup;
