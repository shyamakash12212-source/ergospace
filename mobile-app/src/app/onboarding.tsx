
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const slides = [
  {
    number: '01',
    emoji: '🪑',
    title: 'Build Your Perfect Workspace',
    description:
      'Discover ergonomic desk accessories designed to make your workspace more comfortable.',
  },
  {
    number: '02',
    emoji: '💻',
    title: 'Work Smarter Every Day',
    description:
      'Explore products that support better posture, comfort and productivity.',
  },
  {
    number: '03',
    emoji: '✨',
    title: 'Your Comfort Starts Here',
    description:
      'Find the right accessories and create a workspace that works for you.',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const finishOnboarding = async () => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('ergospace_onboarding_completed', 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Unable to save onboarding:', error);
      setLoading(false);
    }
  };

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>ErgoSpace</Text>
        <TouchableOpacity onPress={finishOnboarding}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.illustration}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
          <Text style={styles.slideNumber}>{slide.number}</Text>
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentSlide === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          disabled={loading}
          onPress={() => {
            if (isLastSlide) {
              finishOnboarding();
            } else {
              setCurrentSlide(currentSlide + 1);
            }
          }}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Please wait...' : isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAF9',
    paddingHorizontal: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F766E',
  },
  skip: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: 250,
    height: 250,
    borderRadius: 35,
    backgroundColor: '#DCEFEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 45,
  },
  emoji: {
    fontSize: 105,
  },
  slideNumber: {
    position: 'absolute',
    bottom: 18,
    right: 22,
    color: '#0F766E',
    fontWeight: '800',
    fontSize: 15,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#173B39',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 25,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footer: {
    paddingBottom: 25,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    gap: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 10,
    backgroundColor: '#CBD5D1',
  },
  activeDot: {
    width: 27,
    backgroundColor: '#0F766E',
  },
  button: {
    backgroundColor: '#0F766E',
    paddingVertical: 17,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
