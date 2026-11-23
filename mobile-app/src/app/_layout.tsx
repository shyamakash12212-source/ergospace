
import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="product/[id]"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="login"
          options={{
            title: 'Customer Login',
            headerBackTitle: 'Back',
          }}
        />

        <Stack.Screen
          name="signup"
          options={{
            title: 'Create Account',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </CartProvider>
  );
}
