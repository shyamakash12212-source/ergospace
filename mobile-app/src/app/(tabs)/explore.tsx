
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getProducts, Product } from '../../services/api';

const CATEGORIES = [
  'All',
  'Desk Accessories',
  'Chairs',
  'Stands',
  'Wrist Support',
];

export default function ExploreScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Explore loading error:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const text = search.trim().toLowerCase();
    const name = product.name?.toLowerCase() ?? '';
    const cat = product.category?.toLowerCase() ?? '';
    const description = product.description?.toLowerCase() ?? '';

    const matchesSearch =
      name.includes(text) ||
      cat.includes(text) ||
      description.includes(text);

    const matchesCategory =
      category === 'All' ||
      (category === 'Chairs' &&
        (name.includes('chair') || cat.includes('chair') ||
          cat.includes('furniture'))) ||
      (category === 'Stands' &&
        (name.includes('stand') || cat.includes('stand'))) ||
      (category === 'Wrist Support' &&
        (name.includes('wrist') || name.includes('mouse pad') ||
          description.includes('wrist'))) ||
      (category === 'Desk Accessories' &&
        (cat.includes('desk') || name.includes('desk')));

    return matchesSearch && matchesCategory;
  });

  const openProduct = (id: string) => {
    router.push({
      pathname: '/product/[id]',
      params: { id },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>Explore ErgoSpace</Text>
          <Text style={styles.subtitle}>
            Find the perfect products for your workspace.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search ergonomic products..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryButton,
                  category === item && styles.selectedCategory,
                ]}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === item && styles.selectedText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Products</Text>
            <Text style={styles.count}>
              {filteredProducts.length} Products
            </Text>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#0F766E" />
              <Text style={styles.info}>Loading products...</Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.error}>{error}</Text>
              <TouchableOpacity style={styles.retry} onPress={loadProducts}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.info}>No products found.</Text>
              <TouchableOpacity
                style={styles.retry}
                onPress={() => {
                  setSearch('');
                  setCategory('All');
                }}
              >
                <Text style={styles.retryText}>View All Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredProducts.map((product) => (
                <TouchableOpacity
                  key={product._id}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => openProduct(String(product._id))}
                >
                  {product.image ? (
                    <Image
                      source={{ uri: product.image }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.placeholder}>
                      <Text style={styles.placeholderIcon}>🪑</Text>
                      <Text>No Image</Text>
                    </View>
                  )}

                  <View style={styles.productInfo}>
                    <Text style={styles.productCategory}>
                      {product.category}
                    </Text>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.price}>₹{product.price}</Text>
                    <Text style={styles.details}>View Details →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>ErgoSpace</Text>
          <Text style={styles.footerText}>Work Better. Feel Better.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 55, paddingBottom: 18 },
  logo: { fontSize: 27, fontWeight: '800', color: '#0F766E' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 7 },
  searchBox: {
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: { fontSize: 17, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 15,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5E5',
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 25,
    marginRight: 10,
  },
  selectedCategory: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  categoryText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  selectedText: { color: '#FFFFFF' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: { color: '#64748B', fontSize: 12, marginBottom: 15 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  image: { width: '100%', height: 145, backgroundColor: '#F1F5F9' },
  placeholder: {
    height: 145,
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: { fontSize: 40 },
  productInfo: { padding: 12 },
  productCategory: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  productName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    minHeight: 38,
  },
  price: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 9,
  },
  details: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 35 },
  info: { color: '#64748B', fontSize: 13, marginTop: 12 },
  error: { color: '#DC2626', textAlign: 'center' },
  retry: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
  footer: {
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingVertical: 25,
    marginTop: 25,
  },
  footerTitle: { color: '#5EEAD4', fontSize: 22, fontWeight: '800' },
  footerText: { color: '#CBD5E1', fontSize: 12, marginTop: 7 },
});
