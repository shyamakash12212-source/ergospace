import { useRouter } from 'expo-router';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from '../context/CartContext';

export default function CartScreen() {
  const router = useRouter();

  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    cartTotal,
  } = useCart();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Continue Shopping</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Shopping Cart</Text>

        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyText}>
              Add products to your cart to see them here.
            </Text>

            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.shopButtonText}>Explore Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cartItems.map((item) => (
              <View key={item.product._id} style={styles.cartCard}>
                {item.product.image ? (
                  <Image
                    source={{ uri: item.product.image }}
                    style={styles.productImage}
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={{ fontSize: 35 }}>🪑</Text>
                  </View>
                )}

                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {item.product.name}
                  </Text>

                  <Text style={styles.price}>
                    ₹{item.product.price}
                  </Text>

                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        decreaseQuantity(item.product._id)
                      }
                    >
                      <Text style={styles.quantityText}>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.quantity}>
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        increaseQuantity(item.product._id)
                      }
                    >
                      <Text style={styles.quantityText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      removeFromCart(item.product._id)
                    }
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>
                  ₹{cartTotal.toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => router.push('/checkout')}
              >
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },
  backButton: {
    padding: 18,
  },
  backText: {
    color: '#087F68',
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#18372D',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 55,
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: '700',
    marginTop: 15,
    color: '#18372D',
  },
  emptyText: {
    color: '#65736B',
    marginTop: 8,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#087F68',
    padding: 15,
    borderRadius: 10,
    marginTop: 22,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 15,
    padding: 12,
    borderRadius: 14,
  },
  productImage: {
    width: 105,
    height: 110,
    borderRadius: 10,
  },
  placeholder: {
    width: 105,
    height: 110,
    backgroundColor: '#EDF5F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18372D',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#087F68',
    marginTop: 7,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#E8F3EF',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 20,
    color: '#087F68',
    fontWeight: '700',
  },
  quantity: {
    marginHorizontal: 15,
    fontWeight: '700',
  },
  removeText: {
    color: '#D04444',
    fontWeight: '600',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 14,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18372D',
    marginBottom: 18,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 17,
    color: '#65736B',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#087F68',
  },
  checkoutButton: {
    backgroundColor: '#087F68',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 22,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});