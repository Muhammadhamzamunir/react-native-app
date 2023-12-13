import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, getFirestore, collection } from "firebase/firestore";
import app from "./firebase/config";

const AuthContext = createContext();

export const AuthContextApi = ({ children }) => {
  const [user, setUser] = useState(null);
  const auth = getAuth();
    const updateUserInContext = (updatedUser) => {
    setUser(updatedUser);
  };
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    AsyncStorage.getItem("user").then((userData) => {
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
        console.log("user from storage: ", parsedUserData);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userId = firebaseUser.uid;
        const db = getFirestore(app);
        const usersCollection = collection(db, "users");
        const authUserDoc = doc(usersCollection, userId);

        getDoc(authUserDoc).then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            const updatedUserData = { ...userData, uid: userId };
            const userDataString = JSON.stringify(updatedUserData);

            setUser(updatedUserData);

            AsyncStorage.setItem("user", userDataString).then(() => {
              console.log("User stored in local storage");
            });
          }
        });
      } else {
        AsyncStorage.removeItem("user").then(() => {
          console.log("User removed from local storage");
        });

        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  return <AuthContext.Provider value={{user,updateUserInContext}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 
