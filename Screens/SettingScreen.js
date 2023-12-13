import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import Colors from "../assets/Colors";
import { useAuth } from "../AuthContextApi";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "../firebase/config";
const SettingScreen = () => {
  const { user, updateUserInContext } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ margin: 10, flex: 1 }}>
        {user && (
          <View>
            <TouchableOpacity style={styles.settingInsideBtn}>
              <Text style={styles.settingBtnText}>Account Information</Text>
              <Icon name="angle-right" size={20} color="grey" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingInsideBtn}>
              <Text style={styles.settingBtnText}>Address Book</Text>
              <Icon name="angle-right" size={20} color="grey" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingInsideBtn}>
              <Text style={styles.settingBtnText}>Change Password</Text>
              <Icon name="angle-right" size={20} color="grey" />
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.settingInsideBtn}>
          <Text style={styles.settingBtnText}>Term and Policies</Text>
          <Icon name="angle-right" size={20} color="grey" />
        </TouchableOpacity>
      </View>

      <View style={styles.logoutbtnView}>
        {user && (
          <TouchableOpacity
            style={styles.logoutbtn}
            onPress={() => {
              const auth = getAuth(app);
              signOut(auth).then(() => {
                console.log("user logged out");
              });
            }}
          >
            <Text
              style={[
                styles.logoutText,
                { textDecorationStyle: "dashed", color: "black" },
              ]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  settingInsideBtn: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoutbtnView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  logoutbtn: {
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
    marginBottom: 15,
  },
  logoutText: {
    color: Colors.primaryColor,
    fontSize: 16,
    marginLeft: 5,
    textAlign: "center",
  },
  settingBtnText: {
    fontSize: 15,
  },
});
