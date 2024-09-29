import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import NavigationService from '../context/NavigationService';
import GenericDropdown from './components/DropDownMenu';
import CustomButton from './components/CustomButton';

import TopBar from './components/TopBarComponent';
const CurrentActivityScreen = () => {
  const data = [
    { id: '1', typeOfAccident: 'Road Accident',name:'ali' },
    { id: '2', typeOfAccident: 'Fire Incident' ,name:'unknown'},
    ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = data.filter((item) =>
        item.name && typeof item.name === 'string' && item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const renderPanel = ({ item }) => (
    <TouchableOpacity className="bg-gray-100 p-4 rounded-lg mb-2">
      <Text className="text-lg font-semibold text-black">Name: <Text className="font-medium">{item.name}</Text></Text>
 
      <Text className="text-sm mt-1">Accident Type: <Text className="font-medium">{item.typeOfAccident}</Text></Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-200">
      
      <View className="flex">
        <View className="flex-row justify-start p-2">
          <TouchableOpacity onPress={() => NavigationService.goBack()}>
            <ArrowLeftIcon size="20" color="black" />
          </TouchableOpacity>
        </View>
        <TopBar/>
        <Text className="text-center text-gray-800 text-2xl mb-4">
          Current Activities
        </Text>

        <TextInput
          className="h-10 border border-gray-300 rounded-lg px-3 mb-4 mx-4"
          placeholder="Search..."
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {/* List of Panels */}
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16 }} // Optional: Adds padding around the FlatList content
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderPanel}
          ListEmptyComponent={<Text className="text-center mt-4 text-gray-500">No results found</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

export default CurrentActivityScreen;
