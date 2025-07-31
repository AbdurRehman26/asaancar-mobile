import { Tabs } from 'expo-router';
import React, { useContext } from 'react';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthContext } from '../_layout';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7e246c',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
            position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? "house.fill" : "house"} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'My Bookings',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? "doc.text.fill" : "doc.text"} 
              color={color} 
            />
          ),
          tabBarButton: isLoggedIn ? HapticTab : () => null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? "message.fill" : "message"} 
              color={color} 
            />
          ),
          tabBarButton: isLoggedIn ? HapticTab : () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? "person.fill" : "person"} 
              color={color} 
            />
          ),
          tabBarButton: isLoggedIn ? HapticTab : () => null,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? "person.circle.fill" : "person.circle"} 
              color={color} 
            />
          ),
          tabBarButton: !isLoggedIn ? HapticTab : () => null,
        }}
      />
    </Tabs>
  );
}
