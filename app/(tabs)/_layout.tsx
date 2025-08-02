import { Tabs } from 'expo-router';
import React, { useContext } from 'react';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { AuthContext } from '../_layout';

export default function TabLayout() {
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
          height: 100,
          paddingBottom: 60,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
          color: '#7e246c',
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
          title: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? "calendar.fill" : "calendar"} 
              color={color} 
            />
          ),
          href: isLoggedIn ? undefined : null,
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
          href: isLoggedIn ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? "gearshape.fill" : "gearshape"} 
              color={color} 
            />
          ),
          href: isLoggedIn ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? "person.badge.plus.fill" : "person.badge.plus"} 
              color={color} 
            />
          ),
          href: !isLoggedIn ? undefined : null,
        }}
      />
    </Tabs>
  );
}
