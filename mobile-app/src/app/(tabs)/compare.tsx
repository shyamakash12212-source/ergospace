
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { getProducts, Product } from '@/services/api';
import { Image } from 'expo-image';

export default function CompareScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError('');
      const data = await getProducts();
      setProducts(data);
    } catch {
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleProduct(product: Product) {
    setSelected((previous) => {
      const exists = previous.some((item) => item._id === product._id);

      if (exists) {
        return previous.filter((item) => item._id !== product._id);
      }

      if (previous.length >= 3) {
        setError('You can compare up to 3 products.');
        return previous;
      }

      setError('');
      return [...previous, product];
    });
  }

  function ProductImage({ image }: { image?: string }) {
    return (
      <View style={styles.imageContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.productImage}
            contentFit="contain"
            transition={200}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Compare Products</Text>
      <Text style={styles.subtitle}>
        Select up to 3 ergonomic products to compare.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0F766E" />
      ) : error && products.length === 0 ? (
        <View>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={loadProducts}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Available Products</Text>

          {products.map((product) => {
            const isSelected = selected.some(
              (item) => item._id === product._id
            );

            return (
              <TouchableOpacity
                key={product._id}
                style={[
                  styles.productCard,
                  isSelected && styles.selectedCard,
                ]}
                onPress={() => toggleProduct(product)}
              >
                <ProductImage image={product.image} />

                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.category}>{product.category}</Text>
                  <Text style={styles.price}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </Text>
                </View>

                <Text style={styles.selectText}>
                  {isSelected ? '✓ Selected' : '+ Compare'}
                </Text>
              </TouchableOpacity>
            );
          })}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.comparisonSection}>
            <Text style={styles.sectionTitle}>
              Comparison ({selected.length}/3)
            </Text>

            {selected.length === 0 ? (
              <Text style={styles.emptyText}>
                Select products above to start comparing.
              </Text>
            ) : (
              selected.map((product) => (
                <View key={product._id} style={styles.compareCard}>
                  <ProductImage image={product.image} />

                  <Text style={styles.productName}>{product.name}</Text>

                  <Text style={styles.detail}>
                    Category: {product.category}
                  </Text>

                  <Text style={styles.detail}>
                    Price: ₹{product.price.toLocaleString('en-IN')}
                  </Text>

                  <Text style={styles.detail}>
                    Description: {product.description || 'Not available'}
                  </Text>

                  <TouchableOpacity
                    onPress={() => toggleProduct(product)}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            {selected.length >= 2 && (
              <Text style={styles.success}>
                {selected.length} products selected for comparison.
              </Text>
            )}

            {selected.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSelected([]);
                  setError('');
                }}
              >
                <Text style={styles.buttonText}>Clear Selection</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
    padding: 20,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#123B40',
    marginTop: 35,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#123B40',
    marginBottom: 15,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: '#0F766E',
    backgroundColor: '#E6F4F1',
  },
  imageContainer: {
    width: 85,
    height: 85,
    borderRadius: 10,
    backgroundColor: '#F1F5F5',
    overflow: 'hidden',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 11,
    color: '#64748B',
  },
  productInfo: {
    flex: 1,
    paddingRight: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#123B40',
  },
  category: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F766E',
    marginTop: 7,
  },
  selectText: {
    color: '#0F766E',
    fontWeight: 'bold',
    fontSize: 12,
  },
  comparisonSection: {
    marginTop: 25,
    marginBottom: 35,
  },
  emptyText: {
    color: '#64748B',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  compareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCE5E5',
  },
  detail: {
    color: '#475569',
    fontSize: 14,
    marginTop: 8,
  },
  removeText: {
    color: '#DC2626',
    fontWeight: 'bold',
    marginTop: 14,
  },
  success: {
    color: '#0F766E',
    fontWeight: 'bold',
    marginTop: 12,
  },
  error: {
    color: '#DC2626',
    marginVertical: 12,
  },
  button: {
    backgroundColor: '#0F766E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#123B40',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
