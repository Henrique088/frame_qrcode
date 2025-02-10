import { useState, useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import {
  Camera,
  useCameraDevice,
  CodeScanner,
} from "react-native-vision-camera";
import {Link, useRouter} from 'expo-router';

export function Qr_code() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const device = useCameraDevice("back"); // Obtém a câmera traseira
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      console.log("Camera Permission:", permission);
      setHasPermission(permission === "granted");
      console.log("Camera haspermission:", hasPermission);
      
    })();
  }, []);

  useEffect(() => {
    if (qrCode) {
      console.log("QR Code lido:", qrCode);
      setTimeout(() => {
      router.push("/");
      },3000);
    }
  }, [qrCode]);


  const codeScanner: CodeScanner = {
    codeTypes: ["qr", "ean-13"],
    onCodeScanned: (codes) => {
      console.log(`Scanned ${codes[0].value} codes!`);
      setQrCode(codes[0].value); 
      
    },
  };

  // Aguarda até ter uma resposta sobre a permissão da câmera
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
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        isActive={true}
        device={device}
        codeScanner={codeScanner}
      />
      {/* Exibir o QR Code lido na tela */}
      {qrCode && (
        <View
          style={{
            position: "absolute",
            bottom: 50,
            left: 20,
            right: 20,
            backgroundColor: "white",
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>QR Code lido:</Text>
          <Text>{qrCode}</Text>
          
        </View>
        
      )}
    </View>
  );
}

export default Qr_code;