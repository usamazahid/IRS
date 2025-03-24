import React from 'react';
import { View, Text, TouchableOpacity ,ActivityIndicator} from 'react-native';
// Import the icon library (e.g., Heroicons) 

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  activeOpacity?: number;
  variant?: 'default' | 'outlined'; // Variant prop
  IconComponent?: React.FC<{ size?: number; color?: string }>; // IconComponent prop
  disabled?: boolean;
  loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  activeOpacity = 0.7,
  variant = 'default', // Default to the purple background variant
  IconComponent, // Destructure the IconComponent prop
   disabled=false, loading=false

}) => {
  // Define className for each variant
  const buttonClassName =
    variant === 'outlined'
      ? 'py-3 bg-white rounded-3xl shadow-black shadow-md'
      : 'py-3 bg-[#6A5ACD] rounded-3xl';

  const textClassName =
    variant === 'outlined'
      ? 'text-xl text-center text-[#6A5ACD]'
      : 'text-xl text-center text-white';

  return (
    <View className='pt-5 w-full'>
       <TouchableOpacity
        className={buttonClassName}
        activeOpacity={activeOpacity}
        onPress={onPress}
        disabled={disabled || loading}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} // Flexbox styling
      >
        {loading ? (
          <ActivityIndicator 
            color={variant === 'outlined' ? '#6A5ACD' : '#fff'} 
            size="small"
          />
        ) : (
          <>
            {IconComponent && (
              <IconComponent 
                size={24} 
                color={variant === 'outlined' ? '#6A5ACD' : '#fff'} 
              />
            )}
            <Text 
              className={textClassName} 
              style={{ marginLeft: IconComponent ? 8 : 0 }}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
