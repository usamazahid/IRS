// src/components/TextBox.tsx
import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';


interface TextBoxProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  containerStyle?: string;
  labelStyle?: string;
  inputStyle?: string;
  hintText?: string;
  isPassword?: boolean;
}

const TextBox: React.FC<TextBoxProps> = ({
  label,
  placeholder,
  containerStyle,
  labelStyle,
  inputStyle,
  hintText,
  isPassword,
  ...props
}) => {
  return (
    <View className='pt-5'>
      <View className={`relative w-full max-w-sm ${containerStyle}`}>
        {label && (
          <Text className={`absolute top-[-10px] left-3 bg-white text-sm font-semibold text-gray-400 z-10 ${labelStyle}`}>
            {label}
          </Text>
        )}
        <TextInput
          placeholder={placeholder}
          secureTextEntry={isPassword} 
          className={`p-4 text-gray-700 border-gray-800 border rounded-2xl ${inputStyle}`}
          {...props}
        />
        {hintText && <Text className="text-gray-400 left-5">{hintText}</Text>}
      </View>
    </View>
  );
};

export default TextBox;
