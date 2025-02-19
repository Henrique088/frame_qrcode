import React from 'react';
import {useState, useEffect} from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import {useRouter } from 'expo-router';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from "react-native-vision-camera";
import { Worklets } from 'react-native-worklets-core';
import { useTextRecognition } from "react-native-vision-camera-text-recognition";

function Frame() {
  const router = useRouter();
  const device = useCameraDevice('back');
  const options = { language : 'latin' };
  const {scanText} = useTextRecognition(options);
  const [texto, setTexto] = useState<string | null > (null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      console.log("Camera Permission:", permission);
      setHasPermission(permission === "granted");
      console.log("Camera haspermission:", hasPermission);
      
    })();
  }, []);

  useEffect(() => {
    if (texto) {
      console.log("Texto lido:",texto);
      setTimeout(() => {
      router.push("/");
      },3000);
    }
  }, [texto]);

function toggleFlash (){
  setIsFlashOn(prevState =>!prevState);
}
  const myFunctionJS = Worklets.createRunOnJS((text) => {
    setTexto(text);
  });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
  
    const data = scanText(frame);
  
    console.log(data, 'data'); 
  
    if (data?.resultText) {
      myFunctionJS(data.resultText);  // Chama a função JS com o resultado
    }
  }, []);
  
  if (hasPermission === null || !device) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

  if (!hasPermission ) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Permissão da câmera negada.</Text>
      </View>
    );
  }
 

  


  return (
    <>
      {!!device && (
        <View style={{ flex: 1 }}>
          {/* Câmera */}
          <Camera
            style={StyleSheet.absoluteFill}
            torch={isFlashOn ? "on" : "off"} // Controla o flash
            device={device}
            isActive={true}
            mode={"recognize"}
            frameProcessor={frameProcessor}
          />

          {/* Botão de Flash */}
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              <Text style={styles.flashText}>{isFlashOn ? "Flash 🔦 ON" : "Flash 🔦 OFF"}</Text>
            </TouchableOpacity>
          </View>

          {/* Texto reconhecido */}
          <View style={styles.textBox}>
            <Text style={styles.textTitle}>Texto lido:</Text>
            <Text>{texto}</Text>
          </View>
        </View>
      )}
    </>
  );
};

// Estilos do botão e caixa de texto
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 10, // Garante que fique sobre a câmera
  },
  flashButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  flashText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  textBox: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  textTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
export default Frame;

