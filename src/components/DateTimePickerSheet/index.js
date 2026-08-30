import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../theme';

const DateTimePickerSheet = ({
  visible,
  value,
  mode = 'date',
  onChange,
  onClose,
}) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      onClose();
    }
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }
    onChange(selectedDate);
  };

  const picker = (
    <DateTimePicker
      value={value}
      mode={mode}
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      is24Hour
      onChange={handleChange}
      locale="tr-TR"
      themeVariant={colors.statusBar === 'light-content' ? 'dark' : 'light'}
    />
  );

  if (Platform.OS !== 'ios') {
    return picker;
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {picker}
          <Pressable
            onPress={onClose}
            style={[styles.done, { backgroundColor: colors.mintSoft }]}
          >
            <Text style={[styles.doneText, { color: colors.teal }]}>Tamam</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  done: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DateTimePickerSheet;
