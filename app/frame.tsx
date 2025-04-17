import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from "react-native-vision-camera";
import { Worklets } from "react-native-worklets-core";
import { useTextRecognition } from "react-native-vision-camera-text-recognition";
import useAppState from "./appstate";

function Frame() {
  const router = useRouter();
  const device = useCameraDevice("back");
  const options = { language: "latin" };
  const { scanText } = useTextRecognition(options);
  const [texto, setTexto] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const appState = useAppState();
  const isCameraActive = appState === "active";
  const lastValidLote = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === "granted");
    })();
  }, []);

  //codigo para redirecionar se algum texto foi lido e redirecionar
  // useEffect(() => {
  //   if (texto) {
  //     console.log("Texto lido:", texto);
  //     setTimeout(() => {
  //       router.push("/");
  //     }, 3000);
  //   }
  // }, [texto]);

  function toggleFlash() {
    setIsFlashOn((prevState) => !prevState);
  }


  // Função JS para processar o texto lido
  const myFunctionJS = Worklets.createRunOnJS((resultText: string) => {
    if (typeof resultText !== "string") return;
  
    // Caso já tenha lido o lote ignora novas leituras
    if (lastValidLote.current) return;
  

    const lines = resultText.split(/\r?\n/);
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
  
      
      // Caso 1: "Lote:" e o valor vem embaixo
      //esse que está dando errado
      if (/Lote/i.test(line)) { //verifica se a linha contém "Lote"
        const nextLine = lines[i + 1]?.trim();
        const possibleLote = nextLine?.match(/[A-Z0-9\-\/]{6,}/);
        if (possibleLote) {
          const lote = possibleLote[0];
          lastValidLote.current = lote;
          setTexto(`Lote encontrado: ${lote}`);
          return;
        }
      }
  
      // Caso 2: "Lote: XXXX" tudo na mesma linha
      const inlineMatch = line.match(/\b(?:Lote|LOT|L)[\s:]*([A-Z0-9\-\/]{6,})\b/i);
      if (inlineMatch) {
        const lote = inlineMatch[1];
        lastValidLote.current = lote;
        setTexto(`Lote encontrado: ${lote}`);
        return;
      }
    }
  
    setTexto("Lote não encontrado.");
  });


  // Worklet que processa o frame
  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";

    const result = scanText(frame); // retorna { resultText: string }
    console.log("Texto reconhecido:", result?.resultText);
    if (result?.resultText && result.resultText.length > 0) {
      myFunctionJS(result.resultText);
    }
  }, []);

  if (hasPermission === null || !device) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text>Permissão da câmera negada.</Text>
      </View>
    );
  }

  return (
    <>
      {!!device && (
        <View style={{ flex: 1 }}>
          {isCameraActive && (
            <Camera
              style={StyleSheet.absoluteFill}
              torch={isFlashOn ? "on" : "off"}
              device={device}
              isActive={true}
              mode={"recognize"}
              frameProcessor={frameProcessor}
            />
          )}

          {!isCameraActive && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}

          {/* Botão de Flash */}
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              <Text style={styles.flashText}>
                {isFlashOn ? "Flash 🔦 ON" : "Flash 🔦 OFF"}
              </Text>
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
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 10,
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
