import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from '../../context/CartContext';
import { getProducts, Product } from '../../services/api';

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const router = useRouter();
  const { addToCart } = useCart();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError('');
        setProduct(null);

        if (!id) {
          throw new Error('Product ID is missing.');
        }

        const products = await getProducts();

        const selectedProduct = products.find(
          (item) => String(item._id) === String(id)
        );

        if (!selectedProduct) {
          throw new Error('Product not found.');
        }

        if (isMounted) {
          setProduct(selectedProduct);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load product.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product);

    Alert.alert(
      'Success',
      `${product.name} added to cart!`,
      [
        {
          text: 'Continue Shopping',
          style: 'cancel',
        },
        {
          text: 'View Cart',
          onPress: () => router.push('/cart'),
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#087F68" />
        <Text style={styles.message}>Loading product...</Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || 'Product not found.'}
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back to Products</Text>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.placeholder}>🪑</Text>
          )}
        </View>

        <View style={styles.details}>
          <Text style={styles.category}>
            {product.category}
          </Text>

          <Text style={styles.name}>
            {product.name}
          </Text>

          <Text style={styles.price}>
            ₹{product.price}
          </Text>

          <Text style={styles.heading}>
            Product Description
          </Text>

          <Text style={styles.description}>
            {product.description || 'No description available.'}
          </Text>

          {/* Product Features - Separate from Add to Cart */}
          {product.features && product.features.length > 0 && (
            <View>
              <Text style={styles.heading}>Product Features</Text>

              {product.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={styles.cartButton}
            activeOpacity={0.8}
            onPress={handleAddToCart}
          >
            <Text style={styles.cartButtonText}>
              Add to Cart
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: '#E5ECE9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  featureIcon: {
    color: '#087F68',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 12,
  },

  featureText: {
    color: '#263832',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    flex: 1,
  },

  centerContainer: {
    flex: 1,
    backgroundColor: '#F7F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  message: {
    textAlign: 'center',
    marginTop: 12,
    color: '#64748B',
  },

  backButton: {
    padding: 20,
    alignSelf: 'flex-start',
  },

  backText: {
    color: '#087F68',
    fontSize: 15,
    fontWeight: '700',
  },

  imageContainer: {
    height: 280,
    marginHorizontal: 20,
    backgroundColor: '#EDF5F1',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  placeholder: {
    fontSize: 90,
  },

  details: {
    padding: 22,
  },

  category: {
    color: '#84918A',
    fontSize: 13,
    marginBottom: 10,
  },

  name: {
    color: '#18372D',
    fontSize: 27,
    fontWeight: '800',
  },

  price: {
    color: '#087F68',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 15,
  },

  heading: {
    color: '#18372D',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 10,
  },

  description: {
    color: '#65736B',
    fontSize: 15,
    lineHeight: 24,
  },

  cartButton: {
    backgroundColor: '#087F68',
    padding: 17,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 30,
  },

  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  errorText: {
    color: '#B42318',
    textAlign: 'center',
    fontSize: 16,
  },
});