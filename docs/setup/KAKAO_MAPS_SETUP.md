# Kakao Maps API Setup Guide

This guide explains how to set up the Kakao Maps API for the address selection and geocoding features.

## Issue: "OPEN_MAP_AND_LOCAL service disabled" Error

If you're seeing this error in your backend logs:

```
Kakao API error: 403 {
  errorType: 'NotAuthorizedError',
  message: 'App(524 beauty test) disabled OPEN_MAP_AND_LOCAL service.'
}
```

This means your Kakao REST API key doesn't have the required permissions enabled.

## Solution: Enable Required Services

### Step 1: Go to Kakao Developers Console

1. Visit [https://developers.kakao.com](https://developers.kakao.com)
2. Log in with your Kakao account
3. Go to "내 애플리케이션" (My Applications)
4. Select your application (e.g., "524 beauty test")

### Step 2: Enable Local API Services

1. In the left sidebar, click on "앱 설정" (App Settings) → "플랫폼" (Platform)
2. Scroll down to find "Local" or "로컬" section
3. Click "설정" (Settings) or "수정" (Edit)
4. Enable the following services:
   - ✅ **주소 검색** (Address Search) - Required for `geocodeAddress`
   - ✅ **키워드로 장소 검색** (Keyword Place Search) - Required for `keywordSearch`
   - ✅ **좌표로 주소 변환** (Coordinate to Address) - **Required for `reverseGeocode`**
5. Click "저장" (Save)

### Step 3: Verify API Key

Make sure your `.env` file in `packages/api/` has the correct API key:

```bash
KAKAO_REST_API_KEY=your_kakao_rest_api_key
```

This should be the "REST API 키" from your Kakao app settings.

### Step 4: Restart the API Server

After enabling the services, restart your API server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm --filter @524/api dev
```

## Required Kakao API Services

For the full address selection feature to work, you need:

| Service | Korean Name | Purpose | Required For |
|---------|-------------|---------|--------------|
| Address Search | 주소 검색 | Convert address string to coordinates | Forward geocoding |
| Keyword Place Search | 키워드로 장소 검색 | Search for places by name | Address search bar |
| Coordinate to Address | 좌표로 주소 변환 | Convert coordinates to address | Reverse geocoding (map pin) |

## Environment Variables

Make sure you have the correct environment variables set:

### For Mobile/Web App (`packages/mobile/.env`)

```bash
# Kakao JavaScript Key (for web maps)
EXPO_PUBLIC_KAKAO_JS_KEY=your_kakao_javascript_key

# API URL
EXPO_PUBLIC_API_URL=http://localhost:5240
```

### For API Server (`packages/api/.env`)

```bash
# Kakao REST API Key (for backend geocoding)
KAKAO_REST_API_KEY=your_kakao_rest_api_key
```

**Important:** These are **different keys**:
- `EXPO_PUBLIC_KAKAO_JS_KEY`: JavaScript key for the map display (frontend)
- `KAKAO_REST_API_KEY`: REST API key for geocoding services (backend)

You can find both keys in your Kakao app settings under "앱 키" (App Keys).

## Testing the Fix

After enabling the services and setting environment variables:

1. Restart both the API server and the mobile dev server
2. Open your web app at `http://localhost:5242`
3. Navigate to the booking flow
4. On the address selection screen, the map should load
5. As you drag the map, you should see the address update automatically
6. Check the backend logs - you should no longer see the 403 error

## Troubleshooting

### Still Getting 403 Error?

1. **Wait a few minutes**: Kakao API changes can take 1-5 minutes to propagate
2. **Check the correct app**: Make sure you're editing the right application in Kakao console
3. **Verify API key**: Ensure `KAKAO_REST_API_KEY` matches the key from your Kakao app
4. **Check quota**: Kakao has daily API limits - check if you've exceeded them

### API Key Not Working?

1. Go to Kakao Developers Console
2. Navigate to your app → "앱 키" (App Keys)
3. Copy the "REST API 키" (REST API Key)
4. Update your `.env` file
5. Restart the API server

### Need a New API Key?

If you need to create a new Kakao application:

1. Go to [https://developers.kakao.com](https://developers.kakao.com)
2. Click "내 애플리케이션" (My Applications)
3. Click "애플리케이션 추가하기" (Add Application)
4. Fill in the application details
5. After creation, enable the Local API services (see Step 2 above)
6. Copy the REST API key to your `.env` file

## API Endpoints Used

The application uses these Kakao Local API endpoints:

- **Address Search**: `https://dapi.kakao.com/v2/local/search/address.json`
- **Keyword Search**: `https://dapi.kakao.com/v2/local/search/keyword.json`
- **Reverse Geocode**: `https://dapi.kakao.com/v2/local/geo/coord2address.json` ⚠️ **This is the one failing**

## Rate Limits

Kakao Local API has the following limits (as of 2024):

- **Free tier**: 300,000 requests/day
- **Rate limit**: 10 requests/second

If you exceed these limits, you'll get a different error (429 Too Many Requests).

## References

- [Kakao Local API Documentation](https://developers.kakao.com/docs/latest/ko/local/common)
- [Kakao Developers Console](https://developers.kakao.com/console/app)
- [Kakao Local API - Coordinate to Address](https://developers.kakao.com/docs/latest/ko/local/dev-guide#coord-to-address)

## Support

If you continue to have issues after following this guide:

1. Check the backend logs for detailed error messages
2. Verify your Kakao account has the necessary permissions
3. Contact Kakao support if the service cannot be enabled

