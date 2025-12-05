import type { ArtistSearchResult } from '@524/shared';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createBooking, searchArtists } from '../api/client';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { colors } from '../theme/colors';

const webPickerInputStyle: CSSProperties = {
  width: '100%',
  borderRadius: 12,
  border: `1px solid ${colors.border}`,
  padding: '12px 14px',
  fontSize: 16,
  fontFamily: 'inherit',
  backgroundColor: colors.background,
  color: colors.text,
};

interface AndroidDatePickerOptions {
  initialDate: Date;
  onConfirm: (date: Date) => void;
}

function openAndroidDateTimePicker({ initialDate, onConfirm }: AndroidDatePickerOptions) {
  DateTimePickerAndroid.open({
    value: initialDate,
    mode: 'date',
    minimumDate: new Date(),
    onChange: (_event, date) => {
      if (!date) return;

      const selectedDate = new Date(date);
      selectedDate.setHours(initialDate.getHours(), initialDate.getMinutes(), 0, 0);

      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'time',
        is24Hour: true,
        onChange: (_timeEvent, time) => {
          if (!time) return;

          const combinedDate = new Date(selectedDate);
          combinedDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
          onConfirm(combinedDate);
        },
      });
    },
  });
}

function getDefaultAppointmentDate() {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 2);
  return date;
}

function formatDateTimeInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseDateTimeInputValue(value: string) {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateTimeDisplay(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

type BookingSummaryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingSummary'>;

export function BookingSummaryScreen() {
  const navigation = useNavigation<BookingSummaryNavigationProp>();
  const buildPayload = useBookingStore((state) => state.buildPayload);
  const reset = useBookingStore((state) => state.reset);
  const serviceType = useBookingStore((state) => state.serviceType);
  const occasion = useBookingStore((state) => state.occasion);
  const selectedArtistId = useBookingStore((state) => state.selectedArtistId);
  const setSelectedArtist = useBookingStore((state) => state.setSelectedArtist);
  const scheduledDate = useBookingStore((state) => state.scheduledDate);
  const setScheduledDate = useBookingStore((state) => state.setScheduledDate);
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArtistDropdownOpen, setIsArtistDropdownOpen] = useState(false);
  const [isIOSPickerVisible, setIsIOSPickerVisible] = useState(false);
  const defaultAppointmentDate = useMemo(() => getDefaultAppointmentDate(), []);
  const scheduledDateValue = useMemo(
    () => (scheduledDate ? new Date(scheduledDate) : null),
    [scheduledDate]
  );
  const [iosPickerValue, setIOSPickerValue] = useState<Date>(
    scheduledDateValue ?? defaultAppointmentDate
  );
  const [isWebPickerVisible, setIsWebPickerVisible] = useState(false);
  const [webPickerValue, setWebPickerValue] = useState(() =>
    formatDateTimeInputValue(defaultAppointmentDate)
  );
  const [webMinSelectableValue] = useState(() => formatDateTimeInputValue(new Date()));

  const {
    data: artists,
    isLoading: isArtistsLoading,
    isError: isArtistsError,
    refetch: refetchArtists,
  } = useQuery<ArtistSearchResult[]>({
    queryKey: ['artists', serviceType, occasion],
    queryFn: () =>
      searchArtists({
        serviceType: serviceType ?? undefined,
        occasion: occasion ?? undefined,
      }),
    enabled: Boolean(serviceType),
  });

  useEffect(() => {
    const nextDate = scheduledDateValue ?? defaultAppointmentDate;
    setIOSPickerValue(nextDate);
    setWebPickerValue(formatDateTimeInputValue(nextDate));
  }, [scheduledDateValue, defaultAppointmentDate]);

  // User is guaranteed to be logged in (enforced by navigation guard)
  const payload = user ? buildPayload(user.id) : null;
  const selectedArtist = (artists ?? []).find((artist) => artist.id === selectedArtistId) ?? null;
  const formattedAppointment =
    scheduledDateValue !== null
      ? formatDateTimeDisplay(scheduledDateValue)
      : '예약 날짜와 시간을 선택해주세요';
  const isSubmitDisabled = !payload || isSubmitting;

  const handleConfirm = async () => {
    if (!payload) {
      Alert.alert(
        '정보가 부족해요',
        '서비스, 아티스트, 일정 정보를 모두 선택한 후 다시 시도해주세요.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await createBooking(payload);
      Alert.alert('예약 요청 완료', '예약이 성공적으로 생성되었습니다.');
      reset();
      navigation.popToTop();
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      Alert.alert('예약에 실패했습니다', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtist(artistId);
    setIsArtistDropdownOpen(false);
  };

  const openDateTimePicker = () => {
    if (Platform.OS === 'android') {
      openAndroidDateTimePicker({
        initialDate: scheduledDateValue ?? defaultAppointmentDate,
        onConfirm: (date) => setScheduledDate(date.toISOString()),
      });
      return;
    }

    if (Platform.OS === 'web') {
      setWebPickerValue(formatDateTimeInputValue(scheduledDateValue ?? defaultAppointmentDate));
      setIsWebPickerVisible(true);
      return;
    }

    setIsIOSPickerVisible(true);
  };

  const handleIOSPickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setIOSPickerValue(date);
    }
  };

  const handleIOSPickerConfirm = () => {
    setScheduledDate(iosPickerValue.toISOString());
    setIsIOSPickerVisible(false);
  };

  const handleIOSPickerCancel = () => {
    setIOSPickerValue(scheduledDateValue ?? defaultAppointmentDate);
    setIsIOSPickerVisible(false);
  };

  const handleWebPickerChange = (event: ChangeEvent<HTMLInputElement>) => {
    setWebPickerValue(event.target.value);
  };

  const handleWebPickerCancel = () => {
    setWebPickerValue(formatDateTimeInputValue(scheduledDateValue ?? defaultAppointmentDate));
    setIsWebPickerVisible(false);
  };

  const handleWebPickerConfirm = () => {
    const parsed = parseDateTimeInputValue(webPickerValue);
    if (parsed) {
      setScheduledDate(parsed.toISOString());
    }
    setIsWebPickerVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>예약 세부정보</Text>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>아티스트</Text>
            <Text style={styles.fieldHint}>현재 예약 가능한 아티스트 중에서 선택해주세요.</Text>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.selectControl}
              onPress={() => setIsArtistDropdownOpen(true)}
            >
              <View>
                <Text style={selectedArtist ? styles.selectText : styles.placeholderText}>
                  {selectedArtist ? selectedArtist.stageName : '아티스트를 선택해주세요'}
                </Text>
                {selectedArtist && (
                  <Text style={styles.selectSubText}>
                    {selectedArtist.specialties?.length
                      ? selectedArtist.specialties.join(', ')
                      : '전문 분야 정보가 없어요'}
                  </Text>
                )}
              </View>
              <Text style={styles.chevron}>v</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>예약 일정</Text>
            <Text style={styles.fieldHint}>고객이 원하는 날짜와 시간을 선택해주세요.</Text>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.selectControl}
              onPress={openDateTimePicker}
            >
              <View>
                <Text style={scheduledDateValue ? styles.selectText : styles.placeholderText}>
                  {formattedAppointment}
                </Text>
              </View>
              <Text style={styles.calendarGlyph}>CAL</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>예약 요약</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>서비스</Text>
            <Text style={styles.value}>{serviceType ?? '-'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>일정</Text>
            <Text style={styles.value}>{occasion ?? '-'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>아티스트</Text>
            <Text style={styles.value}>{selectedArtist?.stageName ?? '-'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>예약일</Text>
            <Text style={styles.value}>{scheduledDateValue ? formattedAppointment : '-'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>총 금액</Text>
            <Text style={styles.value}>
              {payload?.totalAmount ? `${payload.totalAmount.toLocaleString()}원` : '-'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        accessibilityRole="button"
        style={[styles.ctaButton, isSubmitDisabled && styles.ctaButtonDisabled]}
        onPress={handleConfirm}
        disabled={isSubmitDisabled}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.ctaText}>예약 요청 계속하기</Text>
        )}
      </TouchableOpacity>

      {Platform.OS === 'web' && isWebPickerVisible && (
        <View style={styles.webModalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>예약 날짜/시간 선택</Text>
            <input
              type="datetime-local"
              value={webPickerValue}
              min={webMinSelectableValue}
              onChange={handleWebPickerChange}
              style={webPickerInputStyle}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={handleWebPickerCancel}>
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleWebPickerConfirm}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Modal
        visible={isArtistDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsArtistDropdownOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>아티스트 선택</Text>
            {isArtistsLoading ? (
              <View style={styles.dropdownState}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : isArtistsError ? (
              <TouchableOpacity style={styles.dropdownState} onPress={() => refetchArtists()}>
                <Text style={styles.errorText}>
                  아티스트 목록을 불러오는 중 문제가 발생했어요. 다시 시도하려면 탭하세요.
                </Text>
              </TouchableOpacity>
            ) : (artists ?? []).length === 0 ? (
              <View style={styles.dropdownState}>
                <Text style={styles.placeholderText}>선택 가능한 아티스트가 아직 없어요.</Text>
              </View>
            ) : (
              <ScrollView style={styles.artistList}>
                {artists?.map((artist) => (
                  <TouchableOpacity
                    key={artist.id}
                    style={[
                      styles.artistOption,
                      artist.id === selectedArtistId && styles.artistOptionSelected,
                    ]}
                    onPress={() => handleArtistSelect(artist.id)}
                  >
                    <View style={styles.artistOptionInfo}>
                      <Text style={styles.artistOptionLabel}>{artist.stageName}</Text>
                      <Text style={styles.artistOptionMeta}>
                        {artist.specialties?.length
                          ? artist.specialties.join(', ')
                          : '서비스 정보 없음'}
                      </Text>
                    </View>
                    <View style={styles.artistOptionMetaWrapper}>
                      <Text style={styles.artistOptionMeta}>
                        {artist.averageRating ? artist.averageRating.toFixed(1) : '0.0'}★
                      </Text>
                      <Text style={styles.artistOptionMeta}>{artist.reviewCount} 리뷰</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={() => setIsArtistDropdownOpen(false)}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {Platform.OS === 'ios' && (
        <Modal
          visible={isIOSPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={handleIOSPickerCancel}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>예약 날짜/시간 선택</Text>
              <DateTimePicker
                mode="datetime"
                display="inline"
                value={iosPickerValue}
                minimumDate={new Date()}
                onChange={handleIOSPickerChange}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalButton} onPress={handleIOSPickerCancel}>
                  <Text style={styles.modalButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleIOSPickerConfirm}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>완료</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 16,
    paddingBottom: 24,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 15,
    color: colors.subtle,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  formField: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  fieldHint: {
    fontSize: 13,
    color: colors.muted,
  },
  selectControl: {
    marginTop: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  selectSubText: {
    fontSize: 13,
    color: colors.subtle,
    marginTop: 2,
  },
  placeholderText: {
    fontSize: 15,
    color: colors.muted,
  },
  chevron: {
    fontSize: 18,
    color: colors.subtle,
    marginLeft: 12,
  },
  calendarGlyph: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.subtle,
    marginLeft: 12,
  },
  artistList: {
    maxHeight: 400,
  },
  dropdownState: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
    backgroundColor: colors.background,
  },
  artistOptionSelected: {
    backgroundColor: '#fef3c7',
  },
  artistOptionInfo: {
    flex: 1,
  },
  artistOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  artistOptionMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  artistOptionMetaWrapper: {
    alignItems: 'flex-end',
    gap: 2,
  },
  errorText: {
    fontSize: 13,
    color: '#b91c1c',
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 15,
    color: colors.text,
  },
  modalButtonPrimaryText: {
    color: colors.background,
  },
  webModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
    zIndex: 20,
  },
});

/* helper definitions moved to top */
