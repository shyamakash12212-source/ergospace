import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartItem, useCart } from '../context/CartContext';
import { createOrder } from '../services/api';

export default function CheckoutScreen() {
const router = useRouter();
const { cartItems, cartTotal, clearCart } = useCart();

const [name, setName] = useState('');
const [phone, setPhone] = useState('');
const [address, setAddress] = useState('');

const [orderPlaced, setOrderPlaced] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [orderId, setOrderId] = useState('');
const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);
const [orderedTotal, setOrderedTotal] = useState(0);

const handlePlaceOrder = async () => {
if (isSubmitting) return;

if (cartItems.length === 0) {
  Alert.alert('Empty Cart', 'Please add products before checkout.');
  router.replace('/cart');
  return;
}

const cleanName = name.trim();
const cleanPhone = phone.trim();
const cleanAddress = address.trim();

if (!cleanName || !cleanPhone || !cleanAddress) {
  Alert.alert('Missing Details', 'Please fill in all delivery details.');
  return;
}

if (!/^\d{10}$/.test(cleanPhone)) {
  Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
  return;
}

setIsSubmitting(true);

try {
  const itemsSnapshot = cartItems.map((item) => ({
    ...item,
    product: { ...item.product },
  }));

  const result = await createOrder({
    customer: {
      name: cleanName,
      phone: cleanPhone,
      address: cleanAddress,
    },
    items: cartItems.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    })),
  });

  // Save the confirmation details only after the backend succeeds.
  setOrderedItems(itemsSnapshot);
  setOrderedTotal(result.order.totalAmount);
  setOrderId(result.order._id);

  setName(cleanName);
  setPhone(cleanPhone);
  setAddress(cleanAddress);

  // Clear the cart only after MongoDB confirms the order was saved.
  clearCart();
  setOrderPlaced(true);
} catch (error) {
  console.error('Place order error:', error);

  Alert.alert(
    'Order Failed',
    error instanceof Error
      ? error.message
      : 'Unable to place your order. Please try again.'
  );
} finally {
  setIsSubmitting(false);
}

};

if (orderPlaced) {
return (
<SafeAreaView style={styles.container}>
<ScrollView contentContainerStyle={styles.successContent}>
<View style={styles.successIcon}>
<Text style={styles.checkMark}>✓</Text>
</View>

      <Text style={styles.successTitle}>Order Confirmed!</Text>

      <Text style={styles.successSubtitle}>
        Your order has been successfully saved.
      </Text>

      <View style={styles.orderCard}>
        <Text style={styles.orderLabel}>ORDER ID</Text>
        <Text style={styles.orderId}>{orderId}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <Text style={styles.detailText}>{name}</Text>
        <Text style={styles.detailText}>{phone}</Text>
        <Text style={styles.detailText}>{address}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Order Summary</Text>

        {orderedItems.map((item) => (
          <View key={item.product._id} style={styles.summaryRow}>
            <Text style={styles.productName}>
              {item.product.name} × {item.quantity}
            </Text>

            <Text style={styles.price}>
              ₹{item.product.price * item.quantity}
            </Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{orderedTotal}</Text>
        </View>
      </View>

      <Text style={styles.demoNotice}>
        Order saved successfully. Online payment integration will be added later.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Continue Shopping</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

}

return (
<SafeAreaView style={styles.container}>
<KeyboardAvoidingView
style={{ flex: 1 }}
behavior={Platform.OS === 'ios' ? 'padding' : undefined}
>
<ScrollView contentContainerStyle={styles.content}>
<TouchableOpacity onPress={() => router.back()}>
<Text style={styles.back}>← Back to Cart</Text>
</TouchableOpacity>

      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.subtitle}>Delivery Information</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="10-digit phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={10}
      />

      <Text style={styles.label}>Delivery Address</Text>
      <TextInput
        style={[styles.input, styles.addressInput]}
        placeholder="Enter delivery address"
        value={address}
        onChangeText={setAddress}
        multiline
      />

      <Text style={styles.sectionTitle}>Order Summary</Text>

      {cartItems.map((item) => (
        <View key={item.product._id} style={styles.summaryRow}>
          <Text style={styles.productName}>
            {item.product.name} × {item.quantity}
          </Text>

          <Text style={styles.price}>
            ₹{item.product.price * item.quantity}
          </Text>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>₹{cartTotal}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.disabledButton]}
        onPress={handlePlaceOrder}
        activeOpacity={0.8}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Your order will be saved to the ErgoSpace database. Payment integration will be added later.
      </Text>
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>

);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#F7F9F8',
},
content: {
padding: 20,
paddingBottom: 40,
},
back: {
color: '#16836B',
fontSize: 16,
marginBottom: 20,
fontWeight: '600',
},
title: {
fontSize: 30,
fontWeight: '800',
color: '#183B32',
},
subtitle: {
fontSize: 18,
fontWeight: '600',
marginTop: 25,
marginBottom: 15,
color: '#183B32',
},
label: {
fontSize: 14,
fontWeight: '600',
color: '#333',
marginBottom: 7,
marginTop: 12,
},
input: {
backgroundColor: '#FFFFFF',
borderWidth: 1,
borderColor: '#DCE5E1',
borderRadius: 10,
padding: 14,
fontSize: 15,
color: '#183B32',
},
addressInput: {
height: 100,
textAlignVertical: 'top',
},
sectionTitle: {
fontSize: 20,
fontWeight: 'bold',
color: '#183B32',
marginTop: 25,
marginBottom: 15,
},
summaryRow: {
flexDirection: 'row',
justifyContent: 'space-between',
paddingVertical: 12,
borderBottomWidth: 1,
borderBottomColor: '#E5EAE7',
},
productName: {
flex: 1,
fontSize: 14,
color: '#444',
marginRight: 10,
},
price: {
fontSize: 14,
fontWeight: '600',
color: '#333',
},
totalRow: {
flexDirection: 'row',
justifyContent: 'space-between',
marginTop: 20,
paddingVertical: 15,
},
totalLabel: {
fontSize: 18,
fontWeight: 'bold',
color: '#183B32',
},
totalAmount: {
fontSize: 20,
fontWeight: 'bold',
color: '#16836B',
},
button: {
backgroundColor: '#16836B',
padding: 16,
borderRadius: 12,
alignItems: 'center',
marginTop: 20,
},
disabledButton: {
opacity: 0.6,
},
buttonText: {
color: '#FFFFFF',
fontSize: 16,
fontWeight: 'bold',
},
note: {
textAlign: 'center',
color: '#777',
fontSize: 12,
marginTop: 15,
lineHeight: 18,
},
successContent: {
padding: 20,
paddingBottom: 40,
alignItems: 'center',
},
successIcon: {
width: 75,
height: 75,
borderRadius: 40,
backgroundColor: '#E1F4EC',
justifyContent: 'center',
alignItems: 'center',
marginTop: 30,
},
checkMark: {
fontSize: 42,
color: '#087F68',
fontWeight: '800',
},
successTitle: {
fontSize: 27,
fontWeight: '800',
color: '#183B32',
marginTop: 20,
},
successSubtitle: {
fontSize: 14,
color: '#65736B',
textAlign: 'center',
marginTop: 8,
marginBottom: 25,
},
orderCard: {
width: '100%',
backgroundColor: '#FFFFFF',
borderRadius: 16,
padding: 20,
borderWidth: 1,
borderColor: '#E5ECE9',
},
orderLabel: {
fontSize: 12,
fontWeight: '700',
color: '#84918A',
letterSpacing: 1,
},
orderId: {
fontSize: 20,
fontWeight: '800',
color: '#087F68',
marginTop: 7,
},
divider: {
height: 1,
backgroundColor: '#E5EAE7',
marginVertical: 18,
},
detailText: {
fontSize: 14,
color: '#52645C',
marginBottom: 7,
lineHeight: 21,
},
demoNotice: {
fontSize: 12,
color: '#8A6D3B',
backgroundColor: '#FFF7E6',
padding: 12,
borderRadius: 10,
textAlign: 'center',
marginTop: 18,
lineHeight: 19,
},
});