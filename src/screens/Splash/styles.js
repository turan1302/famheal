import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.18,
  },
  decorBottom: {
    position: 'absolute',
    bottom: -100,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.14,
  },
  decorMid: {
    position: 'absolute',
    top: '28%',
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  brand: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
    maxWidth: 280,
  },
  divider: {
    width: 36,
    height: 3,
    borderRadius: 2,
    marginVertical: 18,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.85,
    maxWidth: 260,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 28,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  version: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.6,
    opacity: 0.55,
  },
});

export default styles;
