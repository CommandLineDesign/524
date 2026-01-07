# 524 Map & Address Integration

## Recommended Approach: Kakao Ecosystem

Use **Kakao Map API** + **Daum Postcode Service** for all location-based features. This aligns with existing Kakao Login and Kakao Pay integrations, keeping everything under one developer portal.

---

## Components Needed

### 1. Daum Postcode Service (Address Input)
**Purpose**: User address entry for service locations  
**Cost**: Free (no API key required)  
**Package**: `react-daum-postcode`

```bash
npm install react-daum-postcode
```

**Returns**:
- Road-name address (도로명주소)
- Lot-number address (지번주소)
- Postal code (5-digit)
- Building name
- District codes (sido, sigungu, bname)

---

### 2. Kakao Local API (Geocoding)
**Purpose**: Convert addresses to coordinates and vice versa  
**Cost**: 300,000 calls/day free  
**Auth**: REST API key from Kakao Developers

**Endpoints**:
| Function | Endpoint |
|----------|----------|
| Address → Coordinates | `/v2/local/search/address.json` |
| Coordinates → Address | `/v2/local/geo/coord2address.json` |
| Keyword Search | `/v2/local/search/keyword.json` |

---

### 3. Kakao Maps SDK (Map Display)
**Purpose**: Display provider locations, service areas  
**Cost**: Included in free tier  
**Auth**: JavaScript key from Kakao Developers

```html
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY"></script>
```

---

## Setup Steps

1. **Kakao Developers Portal**: https://developers.kakao.com
2. Register application (may already exist for Kakao Login)
3. Enable **Kakao Map** in app settings (required as of Dec 2024)
4. Obtain keys:
   - JavaScript Key → Maps SDK
   - REST API Key → Local API calls

---

## Data Flow

```
User enters address → Daum Postcode popup
                           ↓
              Returns structured address data
                           ↓
         Kakao Local API → Get coordinates
                           ↓
              Store in DB: address + lat/lng
                           ↓
         Kakao Maps SDK → Display on map
```

---

## Database Fields (Provider Location)

```sql
service_location_address_road    -- 도로명주소
service_location_address_jibun   -- 지번주소 (legacy support)
service_location_postal_code     -- 5-digit postal code
service_location_lat             -- latitude
service_location_lng             -- longitude
service_location_building_name   -- optional
```

---

## Key Considerations

- **Dual address support**: Store both road-name and jibun formats (some users still use old system)
- **Coordinate precision**: Korean maps can have ~50m location variance; store exact coordinates from geocoding
- **Mobile**: Both Daum Postcode and Kakao Maps have mobile-optimized views
- **Rate limits**: 300k/day is generous but implement caching for repeated geocoding requests
