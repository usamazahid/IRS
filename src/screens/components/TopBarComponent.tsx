// TopBar.tsx

import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native'; 

interface TopBarProps{
  title: string;
  logoLeft: ImageSourcePropType;
  logoRight: ImageSourcePropType;
}

const TopBar: React.FC<TopBarProps> = ({ title, logoLeft, logoRight }) => {
  return (
    <View className="w-full h-20 relative flex-row items-center justify-center">
      <Image source={logoLeft?logoLeft:require('../../assets/img/logo_left.png')} className="absolute top-4 left-4 w-16 h-16" />
      {title?(<Text className="text-lg font-bold text-black text-center">{title}</Text>):null}
      <Image source={logoRight?logoRight:require('../../assets/img/logo_right.png')} className="absolute top-4 right-4 w-16 h-16" />
    </View>
  );
};

export default TopBar;