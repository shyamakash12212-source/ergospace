import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

import { useCart } from '../../context/CartContext';
import { getProducts, Product } from '../../services/api';

const CATEGORIES = [
  'All',
  'Desk Accessories',
  'Chairs',
  'Stands',
  'Wrist Support',
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Desk Accessories': ['desk accessories'],
  Chairs: ['furniture'],
  Stands: ['laptop accessories'],
  'Wrist Support': ['wrist support', 'wrist rest', 'mouse pad'],
};
  
 

export default function HomeScreen() {
  const router = useRouter();
  const { cartCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Product loading error:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchText = search.trim().toLowerCase();

    const productName = product.name?.toLowerCase() ?? '';
    const productCategory = product.category?.toLowerCase() ?? '';
    const productDescription =
      product.description?.toLowerCase() ?? '';

    const matchesSearch =
      productName.includes(searchText) ||
      productCategory.includes(searchText) ||
      productDescription.includes(searchText);

    const categoryKeywords = CATEGORY_KEYWORDS[selectedCategory] ?? [];

    const matchesCategory =
  selectedCategory === 'All' ||
  (selectedCategory === 'Wrist Support'
    ? `${product.name} ${product.description ?? ''}`
        .toLowerCase()
        .includes('wrist')
    : categoryKeywords.some((keyword) =>
        productCategory.includes(keyword)
      ));

    return matchesSearch && matchesCategory;
  });

  const openProduct = (productId: string) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: productId },
    });
  };

  const openCart = () => {
    router.push('/cart');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ErgoSpace</Text>

          <TouchableOpacity
            style={styles.cartButton}
            activeOpacity={0.8}
            onPress={openCart}
          >
            <Text style={styles.cartIcon}>🛒</Text>

            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search ergonomic products..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>
            YOUR WORKSPACE, REIMAGINED
          </Text>

          <Text style={styles.heroTitle}>
            Work Better.{'\n'}Feel Better.
          </Text>

          <Text style={styles.heroDescription}>
            Create your perfect ergonomic workspace with
            thoughtfully designed desk accessories.
          </Text>

          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => {
              setSelectedCategory('All');
              setSearch('');
            }}
          >
            <Text style={styles.heroButtonText}>
              Explore Products →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Browse Categories
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {CATEGORIES.map((category) => {
              const isSelected =
                selectedCategory === category;

              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.selectedCategory,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Featured Products
            </Text>

            <Text style={styles.productCount}>
              {filteredProducts.length} Products
            </Text>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator
                size="large"
                color="#0F766E"
              />

              <Text style={styles.infoText}>
                Loading products...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>
                {error}
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadProducts}
              >
                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.infoText}>
                No products found.
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setSelectedCategory('All');
                  setSearch('');
                }}
              >
                <Text style={styles.retryText}>
                  View All Products
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <TouchableOpacity
                  key={product._id}
                  style={styles.productCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    openProduct(String(product._id))
                  }
                >
                  {product.image ? (
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.placeholderIcon}>
                        🪑
                      </Text>
                    </View>
                  )}

                  <View style={styles.productInfo}>
                    <Text style={styles.productCategory}>
                      {product.category}
                    </Text>

                    <Text
                      style={styles.productName}
                      numberOfLines={2}
                    >
                      {product.name}
                    </Text>

                    <Text style={styles.productPrice}>
                      ₹{product.price}
                    </Text>

                    <Text style={styles.viewDetails}>
                      View Details →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>
            Designed for Better Living
          </Text>

          <Text style={styles.aboutDescription}>
            ErgoSpace helps you build a comfortable and
            productive workspace with ergonomic products
            designed for everyday use.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>
            ErgoSpace
          </Text>

          <Text style={styles.footerText}>
            Work Better. Feel Better.
          </Text>

          <Text style={styles.copyright}>
            ©️ 2026 ErgoSpace. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F766E',
  },

  cartButton: {
    backgroundColor: '#E6F4F1',
    padding: 11,
    borderRadius: 12,
    position: 'relative',
  },

  cartIcon: {
    fontSize: 22,
  },

  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#DC2626',
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 22,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchIcon: {
    fontSize: 17,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },

  hero: {
    backgroundColor: '#0F766E',
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
  },

  heroLabel: {
    color: '#99F6E4',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 15,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 42,
  },

  heroDescription: {
    color: '#D1FAE5',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },

  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },

  heroButtonText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '700',
  },

  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
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

  selectedCategory: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },

  categoryText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },

  selectedCategoryText: {
    color: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  productCount: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 16,
  },

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  productImage: {
    width: '100%',
    height: 135,
    backgroundColor: '#E2E8F0',
  },

  imagePlaceholder: {
    height: 135,
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderIcon: {
    fontSize: 45,
  },

  productInfo: {
    padding: 12,
  },

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

  productPrice: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 9,
  },

  viewDetails: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },

  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
  },

  infoText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 12,
  },

  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  aboutSection: {
    backgroundColor: '#E6F4F1',
    marginHorizontal: 20,
    marginTop: 25,
    padding: 22,
    borderRadius: 16,
  },

  aboutTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },

  aboutDescription: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 21,
  },

  footer: {
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingVertical: 28,
    marginTop: 30,
  },

  footerLogo: {
    color: '#5EEAD4',
    fontSize: 22,
    fontWeight: '800',
  },

  footerText: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 7,
  },

  copyright: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 18,
  },
});