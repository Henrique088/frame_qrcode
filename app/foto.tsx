import { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator, Text, Button, Alert,AppState  } from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import * as MediaLibrary from "expo-media-library";
import useAppState from './appstate';
import RNFS from "react-native-fs";
import * as FileSystem from 'expo-file-system';

function Foto() {
  //const [isCameraActive, setIsCameraActive] = useState(true);
  //const appState = useRef(AppState.currentState);
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const device = useCameraDevice("back");
  //const [photoUri, setPhotoUri] = useState("");
  const [ImageSource, setImageSource] = useState("");
  const albumName = 'Data Access'; // 👈 Nome que vai aparecer na galeria
  const appState = useAppState();
  const isCameraActive = appState === 'active';


 

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      console.log("Camera Permission:", permission);
      setHasPermission(permission === "granted");
    })();
  }, []);
  
  // // Verifica se o app está em segundo plano ou ativo
  // // e ativa/desativa a câmera
  // useEffect(() => {
  //   const subscription = AppState.addEventListener("change", nextAppState => {
  //     if (
  //       appState.current.match(/active/) &&
  //       nextAppState.match(/inactive|background/)
  //     ) {
  //       setIsCameraActive(false);
  //     }

  //     if (
  //       appState.current.match(/inactive|background/) &&
  //       nextAppState === "active"
  //     ) {
  //       setIsCameraActive(true);
  //     }

  //     appState.current = nextAppState;
  //   });

  //   return () => subscription.remove();
  // }, []);

  // Solicitar permissão para salvar no MediaLibrary
  const requestAcessMedia = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Não será possível salvar fotos.");
      return false;
    }
    return true;
  };

  // Tirar foto
  const tira_foto = async () => {
    if (!cameraRef.current) {
      console.warn("Câmera não inicializada corretamente");
      return;
    }
    try {
      //const permission = await requestAcessMedia();
      const photo = await cameraRef.current.takePhoto({
       
        enableAutoRedEyeReduction: true
      });
      
      // Criar um asset no MediaLibrary
      console.log("Foto tirada:", photo);
      const asset = await MediaLibrary.createAssetAsync(photo.path);
      const album = await MediaLibrary.getAlbumAsync(albumName);
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, true); // false = não mover, só vincula
      } else {
        await MediaLibrary.createAlbumAsync(albumName, asset, true);
      }
      setImageSource(asset.uri);
      console.log("Foto tirada:", asset.uri);
      Alert.alert("Sucesso", "Foto salva na galeria!");

      // // Salvar a foto na galeria
      // const permission = await requestAcessMedia();
      // if (permission) {
      //   await MediaLibrary.saveToLibraryAsync(asset.uri);
      //   console.log("Foto salva na galeria:", asset.uri);
      //   Alert.alert("Sucesso", "Foto salva na galeria!");
      // }

      // Enviar para o servidor
      //Update(await FileSystem.readAsStringAsync(asset.uri, {encoding: FileSystem.EncodingType.Base64, }));
      MediaLibrary.deleteAssetsAsync([asset.id])
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
    }
  };

  // Função para enviar foto para o servidor
  async function Update(img) {   
    console.log("Iniciando conversão para Base64...");
    

    if (!img) {
        Alert.alert("Erro", "A URI da imagem está vazia!");
        return;
    }

    
        //Lê a img e converte para Base64
        const base64Image = img // await RNFS.readFile(img, "base64");
       
        
        console.log("Imagem convertida para Base64 (tamanho):", base64Image.length);
        
        
        // const controller = new AbortController();
        // const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        //console.log(JSON.stringify({imagem:base64Image }));

        const param = {
          method: 'POST',           
          body: JSON.stringify({imagem:base64Image }),
          setTimeout: 5000,            
          headers: {
            'Content-type': 'application/json',
          },
        };  
         
           
          const response =  fetch('http://192.168.15.135:9000/salveimage/', param)
          
                 
            .then(async response => {
              console.log("Response Status:", response.status); 
              return await response.text();
          })
        
              .then((data) =>{                      
                  if(data){
                      console.log("Data:", data);
                      console.log("Salvo com sucesso.");
                  }
              }
              ).catch((e) => {                   
                Alert.alert("Erro", `Ocorreu um erro: ${e.message}`);
               
                console.log("Erro ao salvar imagem:", e);
              });

       {/* 
        const response = await fetch("http://192.168.15.135:9000/salveimage/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imagem: base64Image }),
            
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text(); // Captura o erro detalhado do servidor
            throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Salvo com sucesso:", data);
        Alert.alert("Sucesso", "Imagem salva com sucesso!");
        */}

    // } catch (e) {
    //     if (e.name === "AbortError") {
    //         Alert.alert("Erro", "Tempo limite excedido! Verifique sua conexão.");
    //     } else {
    //         Alert.alert("Erro", `Erro ao salvar imagem: ${e.message}`);
    //         console.error("Erro ao salvar imagem:", e);
    //     }
    // }
      
}
  // Pedir permissão para usar a câmera ao montar o componente
  

  // Verificação de permissão e carregamento
  if (hasPermission === null || !device) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Permissão da câmera negada.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {isCameraActive && (
        <Camera
          ref={cameraRef}
          style={{ flex: 1 }}
          device={device}
          isActive={true}
          photo={true}
          photoQualityBalance="speed"
        />
      )}

      <Button title="Tirar Foto" onPress={tira_foto} />
      <Button title="Enviar para o Servidor" onPress={() => Update(ImageSource)} />
    </View>
  );
}

export default Foto;
