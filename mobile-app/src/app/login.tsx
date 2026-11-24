import { useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { customerLogin } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Invalid Phone', 'Enter a valid 10-digit phone number.');
      return;
    }

    if (!password) {
      Alert.alert('Missing Password', 'Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      const result = await customerLogin(phone, password);

      Alert.alert(
        'Login Successful',
        `Welcome, ${result.customer.name}!`,
        [
          {
            text: 'Continue',
            onPress: () =>
  router.replace(returnTo === 'checkout' ? '/checkout' : '/(tabs)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ErgoSpace</Text>

      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>
        Login to your customer account
      </Text>

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter 10-digit phone number"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={styles.label}>Password</Text>

<View style={styles.passwordContainer}>
  <TextInput
    style={styles.passwordInput}
    placeholder="Enter your password"
    secureTextEntry={!showPassword}
    value={password}
    onChangeText={setPassword}
    autoCapitalize="none"
    autoCorrect={false}
    returnKeyType="done"
    blurOnSubmit={false}
  />

  <TouchableOpacity
  style={styles.eyeButton}
  onPress={() => setShowPassword((prev) => !prev)}
  activeOpacity={0.7}
>
  {showPassword ? (
    <Eye size={22} color="#777777" />
  ) : (
    <EyeOff size={22} color="#777777" />
  )}
</TouchableOpacity>
</View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.signupRow}>
        <Text style={styles.normalText}>Don't have an account? </Text>
        <Text
          style={styles.link}
          onPress={() => router.push('/signup')}
        >
          Sign Up
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    padding: 25,
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#087F8C',
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 15,
  },
  passwordContainer: {
  height: 52,
  borderWidth: 1,
  borderColor: '#DDDDDD',
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
},

passwordInput: {
  flex: 1,
  height: '100%',
  paddingHorizontal: 15,
  fontSize: 15,
},

eyeButton: {
  paddingHorizontal: 15,
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},

  button: {
    height: 52,
    backgroundColor: '#087F8C',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  normalText: {
    color: '#555555',
  },
  link: {
    color: '#087F8C',
    fontWeight: 'bold',
  },
});
