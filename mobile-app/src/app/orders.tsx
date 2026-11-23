
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getCustomerOrders } from '../services/api';

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt?: string;
  items?: {
    name?: string;
    quantity: number;
    price?: number;
  }[];
}

const TRACKING_STEPS = [
  'Pending',
  'Confirmed',
  'Shipped',
  'Delivered',
];

const STEP_LABELS = [
  'Order Placed',
  'Order Confirmed',
  'Shipped',
  'Delivered',
];

function OrderTimeline({ status }: { status: string }) {
  const currentStep = TRACKING_STEPS.indexOf(status);

  if (status === 'Cancelled') {
    return (
      <View style={styles.cancelledBox}>
        <Text style={styles.cancelledTitle}>Order Cancelled</Text>
        <Text style={styles.cancelledText}>
          This order has been cancelled.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.timeline}>
      {TRACKING_STEPS.map((step, index) => {
        const completed = currentStep >= index;
        const isLast = index === TRACKING_STEPS.length - 1;

        return (
          <View key={step} style={styles.timelineRow}>
            <View style={styles.timelineIndicator}>
              <View
                style={[
                  styles.timelineDot,
                  completed && styles.completedDot,
                ]}
              >
                {completed && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.timelineLine,
                    currentStep > index && styles.completedLine,
                  ]}
                />
              )}
            </View>

            <Text
              style={[
                styles.timelineLabel,
                completed && styles.completedLabel,
              ]}
            >
              {STEP_LABELS[index]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCustomerOrders();
      setOrders(data.orders || []);
    } catch (error) {
      Alert.alert(
        'Orders',
        error instanceof Error
          ? error.message
          : 'Could not load orders'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  function renderOrder({ item }: { item: Order }) {
    return (
      <View style={styles.card}>
        <Text style={styles.orderId}>
          Order ID: {item._id.slice(-8).toUpperCase()}
        </Text>

        <Text style={styles.amount}>
          ₹{Number(item.totalAmount).toLocaleString('en-IN')}
        </Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {item.status}
          </Text>
        </View>

        {item.createdAt && (
          <Text style={styles.date}>
            Order Date: {new Date(item.createdAt).toLocaleDateString('en-IN')}
          </Text>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Order Tracking</Text>

        <OrderTimeline status={item.status} />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Ordered Products</Text>

        {item.items?.map((product, index) => (
          <View key={index} style={styles.productRow}>
            <Text style={styles.product}>
              {product.name || 'Product'} × {product.quantity}
            </Text>

            {product.price !== undefined && (
              <Text style={styles.productPrice}>
                ₹{product.price * product.quantity}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>

        <TouchableOpacity onPress={loadOrders}>
          <Text style={styles.refresh}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#087F8C"
          style={styles.loader}
        />
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>

          <Text style={styles.emptyText}>
            Your orders will appear here after checkout.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.buttonText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F8',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#123B40',
  },
  refresh: {
    color: '#087F8C',
    fontWeight: '700',
    fontSize: 14,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingBottom: 25,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5ECE9',
  },
  orderId: {
    fontSize: 13,
    color: '#777777',
  },
  amount: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#087F8C',
    marginVertical: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E1F4EC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  statusText: {
    color: '#087F68',
    fontSize: 13,
    fontWeight: '700',
  },
  date: {
    fontSize: 13,
    color: '#777777',
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5EAE7',
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#123B40',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 48,
  },
  timelineIndicator: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C9D5D1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedDot: {
    backgroundColor: '#087F8C',
    borderColor: '#087F8C',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  timelineLine: {
    width: 2,
    height: 25,
    backgroundColor: '#DCE5E1',
  },
  completedLine: {
    backgroundColor: '#087F8C',
  },
  timelineLabel: {
    fontSize: 14,
    color: '#929C97',
    marginLeft: 12,
    paddingTop: 3,
  },
  completedLabel: {
    color: '#123B40',
    fontWeight: '700',
  },
  cancelledBox: {
    backgroundColor: '#FDECEC',
    padding: 14,
    borderRadius: 10,
  },
  cancelledTitle: {
    color: '#B42318',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelledText: {
    color: '#8B3434',
    marginTop: 5,
    fontSize: 13,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  product: {
    flex: 1,
    fontSize: 14,
    color: '#444444',
  },
  productPrice: {
    fontSize: 14,
    color: '#123B40',
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#123B40',
  },
  emptyText: {
    color: '#777777',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#087F8C',
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
