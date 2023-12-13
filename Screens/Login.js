import React, { useState, useEffect } from "react";
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
  SafeAreaView,
  ActivityIndicator,
  Keyboard,
  Dimensions,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import Colors from "../assets/Colors";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useToast } from "native-base";
import { styles } from "./Signup";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/FontAwesome";

const LoginScheme = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});
const ForgetPasswordScheme = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  
});

const Login = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [EmailNotFound,setEmailNotFound]= useState();
  const navigation = useNavigation();
  const auth = getAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setEmailNotFound('')
    setModalVisible(!isModalVisible);
  };

  const handleLogin = async (values, { resetForm }) => {
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      const user = userCredential.user;
      // console.log(user);
      toast.show({
        title: "Success",
        status: "success",
        placement: "top",
        duration: 3000,
        style: { top: "5%", backgroundColor: "#2ecc71" },
      });
      resetForm();
      navigation.goBack();
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";
      toast.show({
        title: errorMessage,
        status: "error",
        placement: "top",
        duration: 3000,
        style: { top: "5%", backgroundColor: "#e74c3c" },
      });
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
   
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={ForgetPasswordScheme}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur,touched, handleSubmit, values, errors }) => (
              <View style={styles.formContainer}>
               <View style={styles.imageContainer}> 
                <Image
                  source={require("../assets/splash.png")}
                  style={styles.image}
                />
                </View>
                <Text style={[styles.title]}>Login</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                />
                {touched.email && errors.email && (
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
                <TouchableOpacity
                  style={{
                    alignSelf: "flex-end",
                    marginHorizontal: 20,
                    marginBottom: 10,
                  }}
                  onPress={toggleModal}
                >
                  <Text
                    style={[
                      styles.loginText,
                      { textDecorationStyle: "dashed", color: "black" },
                    ]}
                  >
                    Forget Password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.regButton}
                  onPress={handleSubmit}
                  // disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator
                      size="small"
                      color={Colors.secondaryColor}
                    />
                  ) : (
                    <Text style={styles.regButtonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View style={styles.rowContainer}>
            <Text style={styles.accountText}>Do Not have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.loginText}>SignUp</Text>
            </TouchableOpacity>
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
  <Formik
    initialValues={{ email: "" }}
    validationSchema={ForgetPasswordScheme}
    onSubmit={(modalValues) => {
      
      setLoading(true);
      sendPasswordResetEmail(auth,modalValues.email).then(
      ()=>{
        toggleModal();
        toast.show({
          title: "Mail sent to your email adress successfully",
          status: "success",
          placement: "top",
          duration: 3000,
          style: { top: "5%", backgroundColor: "#2ecc71" },
        })
        setLoading(false);
      }
      ).catch((error)=>{
        let errorMessage = "An error occurred. Please try again.";
        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Invalid email address.";
            setEmailNotFound('Invalid email address.')
            break;
        }
        toast.show({
          title: errorMessage,
          status: "error",
          placement: "top",
          duration: 3000,
          style: { top: "5%", backgroundColor: "#e74c3c" },
        });
        setLoading(false);
      })
    }}
  >
    {({ handleChange, handleBlur, handleSubmit: modalHandleSubmit, values, errors }) => (
      <View
        style={[
          customCSS.modalContainer,
          { height: 200 + keyboardHeight },
        ]}
      >
        <Text style={customCSS.modalTitle}>Forget Password</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={toggleModal}
        >
          <Icon name="times" size={20} color="black" />
        </TouchableOpacity>
        <View
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            value={values.email}
          />
          <Text style={styles.errorText}>{errors.email?errors.email:EmailNotFound}</Text>
          <TouchableOpacity
            style={styles.regButton}
            onPress={modalHandleSubmit} 
          >
            {loading ? (
                    <ActivityIndicator
                      size="small"
                      color={Colors.secondaryColor}
                    />
                  ) : (
                    <Text style={styles.regButtonText}>Send Link</Text>
                  )}
          </TouchableOpacity>
        </View>
      </View>
    )}
  </Formik>
</Modal>
{/* ----------------------------Modal End--------------------------------------------------------------------------*/}

{/* ----------------------------Modal End--------------------------------------------------------------------------*/}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
const customCSS = StyleSheet.create({
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
});
