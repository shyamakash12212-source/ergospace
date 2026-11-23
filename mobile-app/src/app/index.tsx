import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function IndexScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(async () => {
      try {
        const completed = await AsyncStorage.getItem(
          'ergospace_onboarding_completed'
        );

        if (completed === 'true') {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('App startup error:', error);
        router.replace('/onboarding');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>E</Text>
        </View>

        <Text style={styles.logo}>
          Ergo<Text style={styles.logoAccent}>Space</Text>
        </Text>

        <View style={styles.line} />

        <Text style={styles.welcome}>Welcome to ErgoSpace</Text>

        <Text style={styles.tagline}>
          Create a workspace that feels better.
        </Text>

        <View style={styles.loaderSection}>
          <View style={styles.loader} />
          <Text style={styles.loadingText}>
            YOUR SPACE. YOUR COMFORT.
          </Text>
        </View>
      </Animated.View>

      <Text style={styles.version}>ERGOSPACE MOBILE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#075E57',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
  },
  logoLetter: {
    fontSize: 52,
    fontWeight: '900',
    color: '#075E57',
  },
  logo: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  logoAccent: {
    color: '#8DE0CE',
  },
  line: {
    width: 55,
    height: 4,
    borderRadius: 5,
    backgroundColor: '#8DE0CE',
    marginVertical: 27,
  },
  welcome: {
    fontSize: 23,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#D5ECE7',
    marginTop: 12,
    textAlign: 'center',
  },
  loaderSection: {
    alignItems: 'center',
    marginTop: 65,
  },
  loader: {
    width: 42,
    height: 4,
    borderRadius: 5,
    backgroundColor: '#8DE0CE',
    marginBottom: 14,
  },
  loadingText: {
    fontSize: 10,
    color: '#C6E9E1',
    fontWeight: '700',
    letterSpacing: 2,
  },
  version: {
    position: 'absolute',
    bottom: 35,
    fontSize: 10,
    color: '#A8D4CC',
    letterSpacing: 2,
    fontWeight: '600',
  },
});
