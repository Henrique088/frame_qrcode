import React, { useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { scanOCR } from "vision-camera-ocr";
import { runOnJS } from "react-native-reanimated";
import {
    Camera,
    useCameraDevice,
    useFrameProcessor,
    
  } from "react-native-vision-camera";



export function Frame() {
    const device = useCameraDevice( 'back');
    const [text, setText] = useState('');
    const frameProcessor = useFrameProcessor((frame) => {
        'worklet'
        
        const data = scanOCR(frame);
        
        runOnJS(setText)(data.result.text);
      }, [])


   if (!device) {
       return (
         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
           <ActivityIndicator size="large" color="#0000ff" />
         </View>
       );
     }
      
    return (
      <Camera 
      style={{ flex: 1 }}
      isActive={true}
      device={device}
      frameProcessor={frameProcessor} 

    />);

}




export default Frame;