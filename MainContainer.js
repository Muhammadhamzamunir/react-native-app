// MainContainer.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  // SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "./AuthContextApi";
import Colors from "./assets/Colors";
import Main from "./Screens/Home";
import Login from "./Screens/Login";
import Signup from "./Screens/Signup";
import Account from "./Screens/Account";
import Cart from "./Screens/Cart";
import RegisterBakery from "./Screens/RegisterBakery";
import SettingScreen from "./Screens/SettingScreen";
import BakeryDetailed from "./Screens/BakeryDetailed";
import MyStore from "./Screens/MyStore";
import RegisterProduct from "./Screens/RegisterProduct";
import CakeDetailPage from "./Screens/CakeDetailPage";
import CakeList from "./Screens/CakeList";
import AllCategory from "./Screens/AllCategory";
import CakesByCategory from "./Screens/CakesByCategory";
const homeName = "Home";
const loginName = "Login";
const signupName = "Signup";
const acountName = "Account";
const cartName = "Cart";
const mystoreName = "MyStore";
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabNavigator = () => {
  const { user, updateUserInContext } = useAuth();

  return (
    <Tab.Navigator
      initialRouteName={homeName}
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors.primaryColor,
        tabBarInactiveTintColor: "grey",
        tabBarStyle: [{ padding: 10, height: 55 }],
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let rn = route.name;

          if (rn === homeName) {
            iconName = focused ? "home" : "home-outline";
          } else if (rn === cartName) {
            iconName = focused ? "cart" : "cart-outline";
          } else if (rn === mystoreName) {
            iconName = focused ? "heart" : "heart-outline";
          } else if (rn === acountName) {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name={homeName}
        component={Main}
        options={{ headerShown: false }}
      />
      {user ? (
        <Tab.Screen name={cartName} component={Cart} />
      ) : (
        <Tab.Screen name={cartName} component={Login} />
      )}
      {user && user.isBakeryRegistered && (
        <Tab.Screen name={mystoreName} component={MyStore} />
      )}

      <Tab.Screen
        name={acountName}
        component={Account}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "Account",
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => {
                navigation.navigate("Settings");
              }}
            >
              <Ionicons name="settings" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

function MainContainer() {
  const { user, updateUserInContext } = useAuth();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={homeName}>
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ title: "Home", headerShown: false }}
        />
        <Stack.Screen
          name={signupName}
          component={Signup}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={loginName}
          component={Login}
          options={{
            headerShown: true,
            title: ' ',
            headerStyle: {
              backgroundColor: Colors.primaryColor, 
              borderBottomWidth: 0,
            },
            headerTintColor: 'white', 
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerBackTitleVisible: false, 
            headerLeft: ({ onPress }) => (
              <Ionicons
                name="arrow-back"
                size={24}
                color="white"
                style={{ marginLeft: 15 }}
                onPress={onPress}
              />
            ),
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingScreen}
          options={{ headerShown: true }}
        />

        {user ? (
          <Stack.Screen
            name="RegisterBakery"
            component={RegisterBakery}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="RegisterBakery"
            component={Login}
            options={{ headerShown: true }}
          />
        )}
        <Stack.Screen
          name="BakeryDetail"
          component={BakeryDetailed}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="RegisterProduct"
          component={RegisterProduct}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CakeDetailPage"
          component={CakeDetailPage}
          options={({ route }) => ({
            title: route.params.item.productName,
            headerShown: true,
            headerStyle: {
              backgroundColor: Colors.primaryColor,
            },
            headerTintColor: "white",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerBackTitleVisible: false,
            headerLeft: ({ onPress }) => (
              <Ionicons
                name="arrow-back"
                size={24}
                color="white"
                style={{ marginLeft: 15 }}
                onPress={onPress}
              />
            ),
          })}
        />

        <Stack.Screen
          name="CakeList"
          component={CakeList}
          options={({ route }) => ({ title: "Cakes" })}
        />
        <Stack.Screen
          name="AllCategory"
          component={AllCategory}
          options={({ route }) => ({ title: "Categories" })}
        />
        <Stack.Screen
          name="CakesByCategory"
          component={CakesByCategory}
          options={({ route }) => ({ title: route.params.category })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MainContainer;
