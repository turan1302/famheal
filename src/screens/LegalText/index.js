import { Text, View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ThemedScreen from '../../components/ThemedScreen';
import { useThemeColors } from '../../theme';
import { LEGAL_DOCS } from '../../legal';

const LegalText = () => {
  const colors = useThemeColors();
  const route = useRoute();
  const doc = LEGAL_DOCS[route.params?.doc] || LEGAL_DOCS.privacy;

  return (
    <ThemedScreen title={doc.title} showBack padTabBar={false}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.body, { color: colors.cardText }]}>{doc.text}</Text>
      </View>
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
});

export default LegalText;
