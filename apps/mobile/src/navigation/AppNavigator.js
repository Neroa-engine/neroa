import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { appColors } from "../lib/theme";
import PlanSelectScreen from "../screens/PlanSelectScreen";
import AuthScreen from "../screens/AuthScreen";
import EngineBoardScreen from "../screens/EngineBoardScreen";
import EngineDetailScreen from "../screens/EngineDetailScreen";
import EngineIntakeScreen from "../screens/EngineIntakeScreen";
import NaruaScreen from "../screens/NaruaScreen";
import SupportScreen from "../screens/SupportScreen";
import SettingsScreen from "../screens/SettingsScreen";

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LoadingView() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appColors.page
      }}
    >
      <ActivityIndicator size="large" color={appColors.blue} />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: appColors.blue,
        tabBarInactiveTintColor: appColors.textSoft,
        tabBarStyle: {
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: "rgba(255,255,255,0.98)",
          borderTopColor: "rgba(148,163,184,0.16)"
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            EngineBoard: "grid-outline",
            Neroa: "sparkles-outline",
            Support: "help-circle-outline",
            Account: "person-circle-outline"
          };

          return <Ionicons name={iconMap[route.name] ?? "ellipse-outline"} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="EngineBoard" component={EngineBoardScreen} options={{ title: "Engines" }} />
      <Tab.Screen name="Neroa" component={NaruaScreen} />
      <Tab.Screen name="Support" component={SupportScreen} />
      <Tab.Screen name="Account" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  const navTheme = useMemo(
    () => ({
      dark: false,
      colors: {
        primary: appColors.blue,
        background: appColors.page,
        card: "#ffffff",
        text: appColors.text,
        border: "rgba(148,163,184,0.14)",
        notification: appColors.violet
      }
    }),
    []
  );

  if (loading) {
    return <LoadingView />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {!user ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="PlanSelect" component={PlanSelectScreen} />
          <RootStack.Screen name="Auth" component={AuthScreen} />
        </RootStack.Navigator>
      ) : (
        <RootStack.Navigator
          screenOptions={{
            headerTintColor: appColors.text,
            headerStyle: { backgroundColor: "#ffffff" },
            headerShadowVisible: false
          }}
        >
          <RootStack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="EngineDetail"
            component={EngineDetailScreen}
            options={{ title: "Engine" }}
          />
          <RootStack.Screen
            name="EngineIntake"
            component={EngineIntakeScreen}
            options={{ title: "New Engine" }}
          />
        </RootStack.Navigator>
      )}
    </NavigationContainer>
  );
}
