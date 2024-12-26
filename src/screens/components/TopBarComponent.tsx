// TopBar.tsx

import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native'; 

import { useSelector } from 'react-redux';

interface TopBarProps{
  title: string;
  logoLeft: ImageSourcePropType;
  logoRight: ImageSourcePropType;
}

const TopBar: React.FC<TopBarProps> = ({ title, logoLeft, logoRight }) => {
   const { user } = useSelector((state: any) => state.auth);

  return (
    <View className="w-full h-20 relative flex-row items-center justify-center">
      <Image source={logoLeft?logoLeft:require('../../assets/img/logo_left.png')} className="absolute top-4 left-4 w-16 h-16" />
      <View className="flex-1 items-center">
        {user?.fullName && <Text className="text-lg font-bold text-purple-600 text-center"> welcome, {user.fullName}!</Text>}
        {title?(<Text className="text-lg font-bold text-black text-center">{title}</Text>):null}
      </View>
      <Image source={logoRight?logoRight:require('../../assets/img/logo_right.png')} className="absolute top-4 right-4 w-16 h-16" />
    </View>
  );
};

export default TopBar;
