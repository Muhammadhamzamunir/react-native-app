import React, { useEffect, useState } from "react";
import { NativeBaseProvider } from "native-base";
import MainContainer from "./MainContainer";
import { AuthContextApi } from "./AuthContextApi";
import { addEventListener } from "@react-native-community/netinfo";

import { View, Text, Image } from "react-native";

export default function App() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isConnected) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ff78a9",
        }}
      >
        <Text
          style={{
            fontSize: 50,
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            fontFamily: "monospace",
          }}
        >
          No Internet
        </Text>
      </View>
    );
  }

  return (
    <NativeBaseProvider>
      <AuthContextApi>
        <MainContainer />
      </AuthContextApi>
    </NativeBaseProvider>
  );
}
