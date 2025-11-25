// App.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppProvider } from './src/context/AppContext';

// Ekranlar
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SummaryScreen from './src/screens/SummaryScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <PaperProvider>
      <AppProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                switch (route.name) {
                  case 'Ana Sayfa':
                    iconName = focused ? 'home' : 'home-outline';
                    break;
                  case 'Geçmiş':
                    iconName = 'history';
                    break;
                  case 'Özet':
                    iconName = 'chart-line';
                    break;
                  default:
                    iconName = 'circle';
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#6200ee',
              tabBarInactiveTintColor: 'gray',
              headerStyle: { backgroundColor: '#6200ee' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            })}
          >
            <Tab.Screen
              name="Ana Sayfa"
              component={HomeScreen}
              options={{ title: 'AI Günlük Asistanım' }}
            />
            <Tab.Screen
              name="Geçmiş"
              component={HistoryScreen}
              options={{ title: 'Geçmiş Kayıtlar' }}
            />
            <Tab.Screen
              name="Özet"
              component={SummaryScreen}
              options={{ title: 'Haftalık Özet' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </AppProvider>
    </PaperProvider>
  );
};

export default App;
