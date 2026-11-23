import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    Customer,
    getCustomerProfile,
    removeCustomerToken,
} from '../services/api';

export default function AccountScreen() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getCustomerProfile();
        setCustomer(profile);
      } catch {
        Alert.alert('Error', 'Could not load account details');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleLogout() {
    await removeCustomerToken();
    setCustomer(null);
    Alert.alert('Logged out', 'You have logged out successfully.');
    router.replace('/login');
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#087F8C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>

      {customer ? (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Customer Name</Text>
            <Text style={styles.value}>{customer.name}</Text>

            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{customer.phone}</Text>
          </View>

          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => router.push('/orders')}
          >
            <Text style={styles.buttonText}>My Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.ordersButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F8',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#123B40',
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 14,
    marginBottom: 22,
  },
  label: {
    color: '#777777',
    fontSize: 14,
    marginTop: 12,
  },
  value: {
    color: '#123B40',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
  },
  ordersButton: {
    backgroundColor: '#087F8C',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  logoutButton: {
    backgroundColor: '#C0392B',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});