import { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator, Text, StyleSheet, Animated  } from "react-native";
import {
  Camera,
  useCameraDevice,
  CodeScanner,
} from "react-native-vision-camera";
import {Link, useRouter} from 'expo-router';
import useAppState from './appstate';

function Qr_code() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const device = useCameraDevice("back"); // Obtém a câmera traseira
  const [qrCode, setQrCode] = useState<string | null>(null);
  const appState = useAppState();
  const isCameraActive = appState === 'active';
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  

// Inicia a animação 
useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0.4,
        duration: 800,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);

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
    <View style={styles.container}>
      
      {isCameraActive && (
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
      )}
  
      {/* Máscara com faixa vertical transparente */}
      <View style={styles.mask}>
        {/* Bloco esquerdo escuro */}
        <View style={styles.sideBlock} />
  
        {/* Faixa vertical transparente */}
        <View style={styles.scanColumn}>
          <View style={styles.topOverlay} />
          
          <View style={styles.scanArea}>
            <Animated.View style={[styles.cornerTopLeft, { opacity: glowOpacity }]} />
            <Animated.View style={[styles.cornerTopRight, { opacity: glowOpacity }]} />
            <Animated.View style={[styles.cornerBottomLeft, { opacity: glowOpacity }]} />
            <Animated.View style={[styles.cornerBottomRight, { opacity: glowOpacity }]} />

          </View>
  
          <View style={styles.bottomOverlay} />
        </View>
  
        {/* Bloco direito escuro */}
        <View style={styles.sideBlock} >
        <Text style={styles.instruction} numberOfLines={1}>
              Aponte para o código de barras
            </Text>
            </View>
      </View>
  
      {/* Resultado do QR/código de barras */}
      {qrCode && (
        <View style={styles.qrResult}>
          <Text style={styles.qrTitle}>Código lido:</Text>
          <Text style={styles.qrValue}>{qrCode}</Text>
        </View>
      )}
    </View>
  );
  
  
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  sideBlock: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
  },
  scanColumn: {
    width: 100,
    flexDirection: 'column',
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scanArea: {
    height: 600,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  instruction: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
    width: 230,
    textAlign: 'center',
    textAlignVertical: 'center',
    right: 30,
  },
  qrResult: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  qrValue: {
    fontSize: 14,
    textAlign: 'center',
  },

  cornerTopLeft: {
    width: 25,
    height: 25,
    borderColor: '#00FF00',
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    width: 25,
    height: 25,
    borderColor: '#00FF00',
    position: 'absolute',
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    width: 25,
    height: 25,
    borderColor: '#00FF00',
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBottomRight: {
    width: 25,
    height: 25,
    borderColor: '#00FF00',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
});

export default Qr_code;