import React from 'react';
import { Image, Text, View } from 'react-native';

import { theme } from '../theme/colors';

export function ArtistPendingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        backgroundColor: '#fff',
        gap: theme.spacing.lg,
      }}
    >
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1827/1827346.png' }}
        style={{ width: 120, height: 120 }}
      />
      <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text }}>
        Please wait for approval
      </Text>
      <Text style={{ textAlign: 'center', color: theme.colors.textMuted }}>
        Thanks for submitting your details. Our team will review your profile and notify you once
        you are approved. You can close the app — we will send a push notification when you are
        verified.
      </Text>
    </View>
  );
}
