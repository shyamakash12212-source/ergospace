import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

const slides = [
  {
    number: '01',
    tag: 'DESIGNED FOR COMFORT',
    title: 'Build Your Perfect Workspace',
    description:
      'Discover ergonomic desk accessories designed to make your workspace more comfortable.',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop',
  },
  {
    number: '02',
    tag: 'WORK SMARTER',
    title: 'Work Smarter Every Day',
    description:
      'Explore products that support better posture, comfort and productivity.',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&auto=format&fit=crop',
  },
  {
    number: '03',
    tag: 'YOUR COMFORT MATTERS',
    title: 'Your Comfort Starts Here',
    description:
      'Find the right accessories and create a workspace that works for you.',
    image:
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1000&auto=format&fit=crop',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  const finishOnboarding = async () => {
    try {
      setLoading(true);
      await AsyncStorage.setItem(
        'ergospace_onboarding_completed',
        'true'
      );
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Unable to save onboarding:', error);
      setLoading(false);
    }
  };

  const imageHeight = Math.min(width * 0.85, height * 0.36);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>ErgoSpace</Text>

        <TouchableOpacity
          onPress={finishOnboarding}
          disabled={loading}
        >
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ImageBackground
          source={{ uri: slide.image }}
          style={[
            styles.imageCard,
            {
              width: width - 50,
              height: imageHeight,
            },
          ]}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          <View style={styles.imageOverlay} />

          <View style={styles.imageTopLabel}>
            <Text style={styles.imageLabel}>ERGOSPACE</Text>
          </View>

          <View style={styles.imageBottom}>
            <Text style={styles.imageTag}>{slide.tag}</Text>
            <Text style={styles.slideNumber}>{slide.number}</Text>
          </View>
        </ImageBackground>

        <View style={styles.textSection}>
          <Text style={styles.title}>{slide.title}</Text>

          <Text style={styles.description}>
            {slide.description}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((item, index) => (
            <View
              key={item.number}
              style={[
                styles.dot,
                currentSlide === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          disabled={loading}
          onPress={() => {
            if (isLastSlide) {
              finishOnboarding();
            } else {
              setCurrentSlide(currentSlide + 1);
            }
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          {currentSlide + 1} OF {slides.length}
        </Text>
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
    paddingTop: 12,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 25,
    fontWeight: '900',
    color: '#087F72',
    letterSpacing: -0.8,
  },
  skip: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCard: {
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: '#DCEFEB',
  },
  imageStyle: {
    borderRadius: 28,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 35, 32, 0.20)',
  },
  imageTopLabel: {
    padding: 20,
  },
  imageLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  imageBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  imageTag: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  slideNumber: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  textSection: {
    alignItems: 'center',
    marginTop: 38,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 29,
    lineHeight: 37,
    fontWeight: '900',
    color: '#123F3B',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#64748B',
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 18,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    gap: 9,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#C9D8D5',
  },
  activeDot: {
    width: 30,
    backgroundColor: '#087F72',
  },
  button: {
    backgroundColor: '#087F72',
    paddingVertical: 19,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#94A3A0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
