# 524 모바일 앱 명세서

> **목적**: 모든 화면, 데이터 수집, 데이터 사용 현황 및 발견된 문제점의 전체 목록
> **최종 업데이트**: 2026년 1월
> **대상**: 디자이너, 개발자, 제품팀

---

## 목차

1. [사용자 유형 및 역할](#1-사용자-유형-및-역할)
2. [화면 목록](#2-화면-목록)
3. [인증 플로우](#3-인증-플로우)
4. [고객 온보딩 플로우](#4-고객-온보딩-플로우)
5. [예약 플로우](#5-예약-플로우)
6. [아티스트 온보딩 플로우](#6-아티스트-온보딩-플로우)
7. [예약 관리](#7-예약-관리)
8. [리뷰 시스템](#8-리뷰-시스템)
9. [메시징 시스템](#9-메시징-시스템)
10. [홈 및 알림](#10-홈-및-알림)
11. [데이터 흐름 요약](#11-데이터-흐름-요약)
12. [주요 문제점 및 이슈](#12-주요-문제점-및-이슈)
13. [권장 사항](#13-권장-사항)

---

## 1. 사용자 유형 및 역할

앱은 두 가지 사용자 유형을 지원합니다:

| 역할 | 설명 | 진입점 |
|------|------|--------|
| **고객** | 뷰티 서비스(헤어, 메이크업) 이용자 | SignupScreen |
| **아티스트** | 뷰티 서비스 제공자 | ArtistSignupScreen |

---

## 2. 화면 목록

### 2.1 전체 화면 목록 (41개 화면)

#### 인증 화면
| 화면 | 파일 | 목적 |
|------|------|------|
| LoginScreen | `LoginScreen.tsx` | 라우터 - 개발/프로덕션 로그인 분기 |
| NewLoginScreen | `NewLoginScreen.tsx` | 프로덕션 로그인 (Figma 디자인) |
| DevLoginScreen | `DevLoginScreen.tsx` | 테스트 계정용 개발 로그인 |
| SignupScreen | `SignupScreen.tsx` | 고객 계정 생성 |
| ArtistSignupScreen | `ArtistSignupScreen.tsx` | 아티스트 계정 생성 |
| SignupConfirmationScreen | `SignupConfirmationScreen.tsx` | 가입 완료 확인 |

#### 고객 온보딩 화면
| 화면 | 파일 | 목적 |
|------|------|------|
| OnboardingFlowScreen | `OnboardingFlowScreen.tsx` | 다단계 온보딩 조율자 |
| OnboardingLookalikeScreen | `OnboardingLookalikeScreen.tsx` | 닮은 연예인 질문 |
| OnboardingServicesScreen | `OnboardingServicesScreen.tsx` | 관심 서비스 선택 |

#### 예약 플로우 화면 (진입)
| 화면 | 파일 | 목적 |
|------|------|------|
| BookingFlowScreen | `booking/BookingFlowScreen.tsx` | 예약 마법사 조율자 |
| LocationInputScreen | `booking/entry/LocationInputScreen.tsx` | 서비스 위치 입력 |
| CelebrityInputScreen | `booking/entry/CelebrityInputScreen.tsx` | 3단계 연예인 질문 |
| CelebrityResultScreen | `booking/entry/CelebrityResultScreen.tsx` | 연예인 결과 표시 |
| IdolQuestionScreen | `booking/entry/IdolQuestionScreen.tsx` | 아이돌 드롭다운 선택 |
| IdolConfirmationScreen | `booking/entry/IdolConfirmationScreen.tsx` | 아이돌 선택 확인 |
| ServiceSelectionScreen | `booking/entry/ServiceSelectionScreen.tsx` | 헤어/메이크업/콤보 선택 |

#### 예약 플로우 화면 (공통)
| 화면 | 파일 | 목적 |
|------|------|------|
| OccasionSelectionScreen | `booking/common/OccasionSelectionScreen.tsx` | 행사 유형 선택 |
| ScheduleSelectionScreen | `booking/common/ScheduleSelectionScreen.tsx` | 날짜/시간 선택 |
| BookingMethodScreen | `booking/common/BookingMethodScreen.tsx` | 예약 방식 유형 |

#### 예약 플로우 화면 (아티스트 선택)
| 화면 | 파일 | 목적 |
|------|------|------|
| ArtistListScreen | `booking/artist/ArtistListScreen.tsx` | 아티스트 검색/필터 |
| ArtistDetailScreen | `booking/artist/ArtistDetailScreen.tsx` | 예약 맥락에서 아티스트 프로필 |

#### 예약 플로우 화면 (시술)
| 화면 | 파일 | 목적 |
|------|------|------|
| TreatmentSelectionScreen | `booking/treatment/TreatmentSelectionScreen.tsx` | 구체적인 시술 선택 |
| StyleSelectionScreen | `booking/treatment/StyleSelectionScreen.tsx` | 스타일 이미지 선택/업로드 |

#### 예약 플로우 화면 (결제)
| 화면 | 파일 | 목적 |
|------|------|------|
| PaymentConfirmationScreen | `booking/checkout/PaymentConfirmationScreen.tsx` | 검토 및 결제 확인 |
| BookingCompleteScreen | `booking/checkout/BookingCompleteScreen.tsx` | 완료 확인 |

#### 예약 관리 화면
| 화면 | 파일 | 목적 |
|------|------|------|
| HomeScreen | `HomeScreen.tsx` | 고객 홈/대시보드 |
| BookingsListScreen | `BookingsListScreen.tsx` | 고객 예약 목록 |
| BookingDetailScreen | `BookingDetailScreen.tsx` | 고객 예약 상세 |
| BookingSummaryScreen | `BookingSummaryScreen.tsx` | 확인 전 요약 |

#### 아티스트 화면
| 화면 | 파일 | 목적 |
|------|------|------|
| ArtistOnboardingFlowScreen | `ArtistOnboardingFlowScreen.tsx` | 4단계 아티스트 프로필 설정 |
| ArtistPendingScreen | `ArtistPendingScreen.tsx` | 관리자 승인 대기 |
| ArtistBookingsListScreen | `ArtistBookingsListScreen.tsx` | 아티스트의 예약 요청 |
| ArtistBookingDetailScreen | `ArtistBookingDetailScreen.tsx` | 아티스트용 예약 상세 |
| ArtistProfileScreen | `ArtistProfileScreen.tsx` | 공개 아티스트 프로필 |
| ArtistReviewsScreen | `ArtistReviewsScreen.tsx` | 아티스트가 받은 리뷰 |

#### 리뷰 화면
| 화면 | 파일 | 목적 |
|------|------|------|
| ReviewSubmissionScreen | `ReviewSubmissionScreen.tsx` | 예약에 대한 리뷰 작성 |
| ReviewConfirmationScreen | `ReviewConfirmationScreen.tsx` | 리뷰 제출 완료 |
| MyReviewsScreen | `MyReviewsScreen.tsx` | 고객이 작성한 리뷰 |

#### 소통 화면
| 화면 | 파일 | 목적 |
|------|------|------|
| ChatsListScreen | `ChatsListScreen.tsx` | 대화 목록 |
| ChatScreen | `ChatScreen.tsx` | 개별 채팅 |
| NotificationInboxScreen | `NotificationInboxScreen.tsx` | 알림 히스토리 |

---

## 3. 인증 플로우

### 3.1 고객 회원가입

**화면**: `SignupScreen.tsx`

| 필드 | 타입 | 유효성 검사 | 저장 위치 | 표시 위치 | 목적 |
|------|------|-------------|-----------|-----------|------|
| 이름 | 문자열 | 2-100자 | `users.name` | 헤더 인사말 | 식별 |
| 이메일 | 문자열 | 유효, 고유 | `users.email` | 표시 안 됨 | 인증 |
| 비밀번호 | 문자열 | 8자 이상, 영문+숫자 | `users.passwordHash` | 없음 | 인증 |
| 전화번호 | 문자열 | 한국 형식 (010-XXXX-XXXX) | `users.phoneNumber` | 표시 안 됨 | 연락/인증 |
| 생년월일 | 날짜 | 유효한 과거 날짜 | `users.birthYear` (연도만) | **절대 안 함** | **미사용** |

**발견된 문제**: 생년은 수집되지만 앱 어디에서도 사용되지 않음.

### 3.2 아티스트 회원가입

**화면**: `ArtistSignupScreen.tsx`

| 필드 | 타입 | 유효성 검사 | 저장 위치 | 표시 위치 | 목적 |
|------|------|-------------|-----------|-----------|------|
| 이메일 | 문자열 | 유효, 고유 | `users.email` | 표시 안 됨 | 인증 |
| 비밀번호 | 문자열 | 8자 이상, 영문+숫자 | `users.passwordHash` | 없음 | 인증 |

**참고**: 아티스트는 회원가입 시 최소 정보만 제공하고, 온보딩에서 프로필을 완성합니다.

---

## 4. 고객 온보딩 플로우

**조건**: `EXPO_PUBLIC_SHOW_CUSTOMER_ONBOARDING` 기능 플래그로 활성화

### 4.1 OnboardingFlowScreen (연예인 질문)

**입력 유형**: `EXPO_PUBLIC_ONBOARDING_INPUT_TYPE`으로 제어

| 필드 | 질문 | 저장 위치 | 고객에게 표시 | 아티스트에게 표시 | 목적 |
|------|------|-----------|---------------|-------------------|------|
| `celebrity_lookalike` | "비슷하다고 들어본 연예인" | `onboarding_responses` | CelebrityResultScreen | **절대 안 함** | 스타일 매칭 |
| `celebrity_similar_image` | "비슷한 이미지 원하는 연예인" | `onboarding_responses` | CelebrityResultScreen | **절대 안 함** | 스타일 매칭 |
| `celebrity_admire` | "예쁘다고 생각하는 연예인" | `onboarding_responses` | CelebrityResultScreen | **절대 안 함** | 스타일 매칭 |
| `resultCelebrity` | 계산된 결과 | `onboarding_responses` | CelebrityResultScreen | **절대 안 함** | 스타일 매칭 |

### 4.2 OnboardingServicesScreen

| 필드 | 옵션 | 저장 위치 | 표시 위치 | 목적 |
|------|------|-----------|-----------|------|
| `service_interests` | 헤어, 메이크업, 헤어 + 메이크업 | `onboarding_responses` | **절대 안 함** | 개인화 |

### 치명적 문제: 연예인/아이돌 데이터

온보딩 설정에 `shareWithStylist: true` 플래그가 있지만, 이는 **구현되지 않음**:

```
수집됨 → 저장됨 → 아티스트와 절대 공유 안 됨
```

**영향**: 아티스트는 고객의 스타일 선호도를 전혀 볼 수 없어, 이 데이터를 수집하는 목적이 무의미해짐.

---

## 5. 예약 플로우

### 5.1 플로우 개요

```
연예인 경로:
LocationInput → ServiceSelection → OccasionSelection → ScheduleSelection →
ArtistList → TreatmentSelection → StyleSelection → PaymentConfirmation → BookingComplete

직접 경로:
ServiceSelection → OccasionSelection → ScheduleSelection →
ArtistList → TreatmentSelection → StyleSelection → PaymentConfirmation → BookingComplete
```

### 5.2 위치 입력

**화면**: `LocationInputScreen.tsx`

| 필드 | 타입 | 저장 위치 | 고객에게 표시 | 아티스트에게 표시 | 상태 |
|------|------|-----------|---------------|-------------------|------|
| `location` | 주소 문자열 | `bookings.serviceLocation` | PaymentConfirmation, BookingDetail | ArtistBookingDetail | 정상 |
| `locationCoordinates` | {lat, lng} | `bookings.address` | 표시 안 됨 | 표시 안 됨 | 정상 |
| `locationNotes` | 텍스트 | `bookings.locationNotes` | **절대 안 함** | **절대 안 함** | **표시 안 됨** |

### 5.3 연예인/아이돌 질문 (예약 플로우)

**화면**: `CelebrityInputScreen.tsx` 또는 `IdolQuestionScreen.tsx`

| 필드 | 저장 위치 | 고객에게 표시 | 아티스트에게 표시 | 상태 |
|------|-----------|---------------|-------------------|------|
| `celebrities.lookalike` | **저장 안 됨** | CelebrityResultScreen (세션만) | **절대 안 함** | **저장 안 됨** |
| `celebrities.similarImage` | **저장 안 됨** | CelebrityResultScreen (세션만) | **절대 안 함** | **저장 안 됨** |
| `celebrities.admire` | **저장 안 됨** | CelebrityResultScreen (세션만) | **절대 안 함** | **저장 안 됨** |
| `resultCelebrity` | **저장 안 됨** | CelebrityResultScreen (세션만) | **절대 안 함** | **저장 안 됨** |

**치명적 문제**: 예약 중 수집된 연예인 데이터는 **데이터베이스에 저장되지 않으며** **아티스트에게 표시되지 않음**.

### 5.4 서비스 선택

**화면**: `ServiceSelectionScreen.tsx`

| 필드 | 옵션 | 저장 위치 | 표시 위치 | 상태 |
|------|------|-----------|-----------|------|
| `serviceType` | hair, makeup, combo | `bookings.serviceType` | **절대 안 함** | **표시 안 됨** |

### 5.5 행사 선택

**화면**: `OccasionSelectionScreen.tsx`

| 필드 | 옵션 | 저장 위치 | 표시 위치 | 상태 |
|------|------|-----------|-----------|------|
| `occasion` | 결혼식, 상견례, 소개팅 등 | `bookings.occasion` | **절대 안 함** | **표시 안 됨** |

**문제**: 행사 유형은 저장되지만 예약 상세에서 고객이나 아티스트에게 표시되지 않음.

### 5.6 일정 선택

**화면**: `ScheduleSelectionScreen.tsx`

| 필드 | 타입 | 저장 위치 | 고객에게 표시 | 아티스트에게 표시 | 상태 |
|------|------|-----------|---------------|-------------------|------|
| `selectedDate` | ISO 날짜 | `bookings.scheduledDate` | BookingDetail | ArtistBookingDetail | 정상 |
| `selectedTimeSlot` | HH:MM | `bookings.scheduledStartTime` | BookingDetail | ArtistBookingDetail | 정상 |

### 5.7 아티스트 선택

**화면**: `ArtistListScreen.tsx`

| 필드 | 타입 | 저장 위치 | 상태 |
|------|------|-----------|------|
| `selectedArtistId` | UUID | `bookings.artistId` | 정상 |
| `artistSortType` | Enum | **저장 안 됨** | 세션만 |
| `artistFilterApplied` | Boolean | **저장 안 됨** | 세션만 |

### 5.8 시술 선택

**화면**: `TreatmentSelectionScreen.tsx`

| 필드 | 타입 | 저장 위치 | 표시 위치 | 상태 |
|------|------|-----------|-----------|------|
| `selectedTreatments[]` | 배열 | `bookings.services` (JSONB) | PaymentConfirmation, BookingDetail, ArtistBookingDetail | 정상 |
| `totalAmount` | 숫자 | `bookings.totalAmount` | PaymentConfirmation, BookingDetail | 정상 |
| `estimatedDuration` | 분 | `bookings.totalDurationMinutes` | PaymentConfirmation, BookingDetail | 정상 |

### 5.9 스타일 선택

**화면**: `StyleSelectionScreen.tsx`

| 필드 | 타입 | 저장 위치 | 고객에게 표시 | 아티스트에게 표시 | 상태 |
|------|------|-----------|---------------|-------------------|------|
| `selectedStyles[]` | 배열 (최대 3개) | **저장 안 됨** | **절대 안 함** | **절대 안 함** | **구현 안 됨** |
| `customStyleImage` | 이미지 URI | **저장 안 됨** | **절대 안 함** | **절대 안 함** | **구현 안 됨** |

**치명적 문제**: 스타일 이미지는 수집되지만 데이터베이스 스키마에 `referenceImages` 필드가 있음에도 **API로 전송되지 않음**.

### 5.10 결제 확인

**화면**: `PaymentConfirmationScreen.tsx`

| 필드 | 타입 | 저장 위치 | 표시 위치 | 상태 |
|------|------|-----------|-----------|------|
| `customerNotes` | 텍스트 | `bookings.specialRequests` | **절대 안 함** | **표시 안 됨** |

**문제**: 고객 메모는 저장되지만 아티스트나 예약 상세에 표시되지 않음.

---

## 6. 아티스트 온보딩 플로우

**조건**: 아티스트의 `stageName`, `primaryLocation` 또는 `profileImageUrl`이 누락된 경우 필수

### 6.1 단계 1: 기본 정보

| 필드 | 타입 | 유효성 검사 | 저장 위치 | 표시 위치 | 상태 |
|------|------|-------------|-----------|-----------|------|
| `stageName` | 문자열 | 1자 이상 | `artistProfiles.stageName` | 아티스트 카드, 상세 화면 | 정상 |
| `bio` | 텍스트 | 최대 1000자 | `artistProfiles.bio` | 아티스트 상세 화면 | 정상 |

### 6.2 단계 2: 전문 분야

| 필드 | 타입 | 옵션 | 저장 위치 | 표시 위치 | 상태 |
|------|------|------|-----------|-----------|------|
| `specialties` | 배열 | hair, makeup | `artistProfiles.specialties` | 아티스트 카드, 필터링 | 정상 |
| `yearsExperience` | 숫자 | 0-100 | `artistProfiles.yearsExperience` | 아티스트 상세 화면 | 정상 |

### 6.3 단계 3: 서비스 지역

| 필드 | 타입 | 저장 위치 | 표시 위치 | 상태 |
|------|------|-----------|-----------|------|
| `primaryLocation` | {lat, lng, address} | `artistProfiles.primaryLocation` | 검색/필터링에 사용 | 정상 |
| `serviceRadiusKm` | 숫자 | `artistProfiles.serviceRadiusKm` | **표시 안 됨** | 로직만 |

### 6.4 단계 4: 프로필 사진

| 필드 | 타입 | 저장 위치 | 표시 위치 | 상태 |
|------|------|-----------|-----------|------|
| `profileImageUrl` | S3 URL | `artistProfiles.profileImageUrl` | 아티스트 카드, 상세 화면 | 정상 |

---

## 7. 예약 관리

### 7.1 고객 뷰: BookingDetailScreen

**표시되는 데이터**:
- 예약 번호
- 상태 배지
- 예약 날짜/시간
- 서비스 목록 (이름, 소요시간, 가격)
- 총 금액
- 위치 주소
- 아티스트 이름
- 결제 상태
- 상태 히스토리 타임라인

**표시되지 않는 데이터** (사용 가능하지만):
- 행사 유형
- 서비스 유형 (헤어/메이크업/콤보)
- 고객 메모/특별 요청
- 스타일 참고 이미지
- 위치 메모

### 7.2 아티스트 뷰: ArtistBookingDetailScreen

**표시되는 데이터**:
- 예약 번호
- 상태 배지
- 예약 날짜/시간 범위
- 서비스 (소요시간, 가격 포함)
- 총 금액 (수수료 포함)
- 결제 상태
- 상태 히스토리
- 액션 버튼 (수락/거절/시작/완료)
- 메시지 버튼

**표시되지 않는 데이터** (치명적 문제):

| 누락된 데이터 | 사용 가능 위치 | 영향 |
|---------------|----------------|------|
| 고객 이름 | `users.name` | 아티스트가 누구에게 서비스하는지 모름 |
| 고객 전화번호 | `users.phoneNumber` | 직접 연락처 없음 |
| 연예인/아이돌 선호도 | `onboarding_responses` | 아티스트가 원하는 스타일 준비 불가 |
| 스타일 참고 이미지 | `bookings.referenceImages`가 될 것 | 아티스트가 고객이 원하는 룩을 볼 수 없음 |
| 고객 메모 | `bookings.specialRequests` | 아티스트가 특별 지시사항 누락 |
| 행사 유형 | `bookings.occasion` | 이벤트 맥락 없음 |
| 고객 알레르기 | `customerProfiles.allergies` | **안전 위험** |
| 고객 민감성 | `customerProfiles.sensitivities` | **안전 위험** |
| 의료 메모 | `customerProfiles.medicalNotes` | **안전 위험** |
| 피부 타입 | `customerProfiles.skinType` | 적절한 제품 준비 불가 |
| 모발 타입 | `customerProfiles.hairType` | 적절한 제품 준비 불가 |

---

## 8. 리뷰 시스템

### 8.1 리뷰 제출

**화면**: `ReviewSubmissionScreen.tsx`

| 필드 | 타입 | 필수 | 저장 위치 | 표시 위치 | 상태 |
|------|------|------|-----------|-----------|------|
| `overallRating` | 1-5 별점 | 예 | `reviews.overallRating` | MyReviews, ArtistReviews | 정상 |
| `qualityRating` | 1-5 별점 | 예 | `reviews.qualityRating` | ArtistReviews (집계) | 정상 |
| `professionalismRating` | 1-5 별점 | 예 | `reviews.professionalismRating` | ArtistReviews (집계) | 정상 |
| `timelinessRating` | 1-5 별점 | 예 | `reviews.timelinessRating` | ArtistReviews (집계) | 정상 |
| `reviewText` | 텍스트 | 아니오 | `reviews.reviewText` | MyReviews, ArtistReviews | 정상 |
| `photos` | 이미지 (최대 5개) | 아니오 | S3 + `review_images` | MyReviews, ArtistReviews | 정상 |

### 8.2 리뷰 표시

**MyReviewsScreen** (고객 뷰):
- 고객이 작성한 리뷰 표시
- 아티스트 답변이 있으면 표시

**ArtistReviewsScreen** (아티스트 뷰):
- 4개 평가 카테고리의 집계 통계 표시
- 받은 모든 리뷰를 페이지네이션으로 나열
- 아티스트가 리뷰에 답변 가능

---

## 9. 메시징 시스템

### 9.1 메시지 데이터

| 필드 | 타입 | 저장 위치 | 상태 |
|------|------|-----------|------|
| `content` | 텍스트 | `messages.content` | 정상 |
| `images` | 배열 | `messages.images` | 정상 |
| `messageType` | text/image/system | `messages.messageType` | 정상 |
| `sentAt` | 타임스탬프 | `messages.sentAt` | 정상 |
| `readAt` | 타임스탬프 | `messages.readAt` | 정상 |

### 9.2 기능
- 양방향 소통 (고객 ↔ 아티스트)
- WebSocket을 통한 실시간 업데이트
- 읽음 확인 및 입력 중 표시
- 메시지 히스토리 완전 보존
- 오프라인 메시지 대기열
- 특정 예약과 연결 가능

---

## 10. 홈 및 알림

### 10.1 HomeScreen

**표시되는 데이터**:
- 사용자 이름 (인사말)
- 다음 예약까지 남은 일수
- 읽지 않은 알림 수

**표시되지 않는 데이터** (사용 가능하지만):
- 예정된 예약의 아티스트 이름
- 예정된 예약의 서비스
- 예약 총 금액
- 예약 번호
- 서비스 위치

**플레이스홀더 섹션** (연결 안 됨):
- "내 예약" 캐러셀 - 가짜 데이터 표시
- "베스트 리뷰" 캐러셀 - 가짜 데이터 표시
- "베스트 아티스트" 캐러셀 - 가짜 데이터 표시

### 10.2 NotificationInboxScreen

**처리되는 알림 유형**:
- `booking_created` → BookingDetail로 이동
- `booking_status_changed` → BookingDetail로 이동
- `new_message` → Chat으로 이동

**문제**: 알림 유형 간 시각적 구분 없음 (아이콘 없음).

---

## 11. 데이터 흐름 요약

### 11.1 고객 데이터 수집 현황

| 데이터 | 수집됨 | DB 저장 | 고객에게 표시 | 아티스트에게 표시 | 판정 |
|--------|--------|---------|---------------|-------------------|------|
| 이름 | 예 | 예 | 헤더만 | **아니오** | 부분적 |
| 이메일 | 예 | 예 | 아니오 | 아니오 | OK (비공개) |
| 전화번호 | 예 | 예 | 아니오 | **아니오** | 문제 |
| 생년 | 예 | 예 | 아니오 | 아니오 | **미사용** |
| 연예인 선호도 | 예 | 예 (온보딩) | 세션만 | **아니오** | **고장** |
| 서비스 관심사 | 예 | 예 | 아니오 | 아니오 | **미사용** |
| 위치 | 예 | 예 | 예 | 예 | 정상 |
| 위치 메모 | 예 | 예 | **아니오** | **아니오** | **표시 안 됨** |
| 서비스 유형 | 예 | 예 | **아니오** | **아니오** | **표시 안 됨** |
| 행사 | 예 | 예 | **아니오** | **아니오** | **표시 안 됨** |
| 스타일 이미지 | 예 | **아니오** | **아니오** | **아니오** | **구현 안 됨** |
| 고객 메모 | 예 | 예 | **아니오** | **아니오** | **표시 안 됨** |
| 피부/모발 타입 | **아니오** | 스키마 존재 | N/A | N/A | **수집 안 됨** |
| 알레르기 | **아니오** | 스키마 존재 | N/A | N/A | **수집 안 됨** |

### 11.2 아티스트 데이터 수집 현황

| 데이터 | 수집됨 | 저장됨 | 고객에게 표시 | 상태 |
|--------|--------|--------|---------------|------|
| 활동명 | 예 | 예 | 예 | 정상 |
| 소개 | 예 | 예 | 예 | 정상 |
| 전문 분야 | 예 | 예 | 예 | 정상 |
| 경력 연수 | 예 | 예 | 예 | 정상 |
| 위치 | 예 | 예 | 검색에 사용 | 정상 |
| 서비스 반경 | 예 | 예 | 표시 안 됨 | 로직만 |
| 프로필 사진 | 예 | 예 | 예 | 정상 |

---

## 12. 주요 문제점 및 이슈

### 12.1 높은 우선순위 - 안전 우려

| 이슈 | 설명 | 위험 수준 |
|------|------|-----------|
| **알레르기 수집 없음** | 고객 알레르기가 수집되지 않음 | **높음** - 안전 위험 |
| **민감성 수집 없음** | 제품 민감성이 수집되지 않음 | **높음** - 안전 위험 |
| **의료 메모 없음** | 의료 고려사항이 수집되지 않음 | **높음** - 안전 위험 |

### 12.2 높은 우선순위 - 핵심 기능 문제

| 이슈 | 설명 | 영향 |
|------|------|------|
| **연예인 데이터 저장 안 됨** | 3단계 연예인 설문 데이터가 저장되지 않음 | 전체 기능이 무용지물 |
| **연예인 데이터가 아티스트에게 안 보임** | 온보딩 연예인 데이터조차 아티스트에게 전달 안 됨 | 아티스트가 스타일 준비 불가 |
| **스타일 이미지 저장 안 됨** | 고객의 선택/업로드한 스타일 참고 이미지가 API로 전송 안 됨 | 아티스트가 원하는 룩을 볼 수 없음 |
| **고객 메모 표시 안 됨** | 특별 요청이 저장되지만 표시 안 됨 | 아티스트가 지시사항 누락 |
| **고객 신원 숨겨짐** | 아티스트가 고객 이름이나 전화번호를 볼 수 없음 | 누구에게 서비스하는지 식별 불가 |

### 12.3 중간 우선순위 - 표시 문제

| 이슈 | 설명 | 영향 |
|------|------|------|
| **행사 표시 안 됨** | 이벤트 유형 저장되지만 표시 안 됨 | 서비스 맥락 없음 |
| **서비스 유형 표시 안 됨** | 헤어/메이크업/콤보가 상세에 안 보임 | 기본 정보 누락 |
| **위치 메모 표시 안 됨** | 추가 위치 정보 안 보임 | 배달 지시사항 누락 |
| **홈화면 플레이스홀더** | 예약 히스토리, 리뷰, 아티스트 캐러셀이 가짜 데이터 표시 | 열악한 사용자 경험 |

### 12.4 낮은 우선순위 - 미사용 데이터

| 이슈 | 설명 | 권장사항 |
|------|------|----------|
| **생년 수집되지만 미사용** | 나이 기반 기능 없음 | 수집 제거 또는 기능 구현 |
| **서비스 관심사 미사용** | 온보딩 데이터가 개인화에 사용 안 됨 | 추천 구현 또는 제거 |
| **서비스 반경 표시 안 됨** | 계산되지만 고객에게 안 보임 | 아티스트 프로필에 추가 |

---

## 13. 권장 사항

### 13.1 즉시 조치 (안전)

1. **알레르기/민감성 수집 추가** - 고객 회원가입 또는 프로필에서
2. **건강 정보를 아티스트에게 눈에 띄게 표시** - 예약 수락 전
3. **의료 메모 필드 추가** - 고객 프로필에

### 13.2 높은 우선순위 (핵심 기능)

1. **연예인/아이돌 데이터 흐름 수정**:
   - 예약 연예인 데이터를 데이터베이스에 저장
   - API로 전송되는 예약 페이로드에 포함
   - ArtistBookingDetailScreen에서 아티스트에게 표시

2. **스타일 이미지 구현**:
   - 예약 페이로드에 `selectedStyles[]`와 `customStyleImage` 전송
   - `bookings.referenceImages`에 저장
   - ArtistBookingDetailScreen에서 아티스트에게 표시

3. **아티스트에게 고객 정보 표시**:
   - ArtistBookingDetailScreen에 고객 이름 추가
   - 특별 요청/메모 섹션 추가
   - 행사 유형 추가

4. **고객 메모 표시 수정**:
   - BookingDetailScreen에 `specialRequests` 표시
   - ArtistBookingDetailScreen에 `specialRequests`를 눈에 띄게 표시

### 13.3 중간 우선순위 (UX 개선)

1. **홈화면 개선**:
   - "내 예약" 캐러셀을 실제 데이터에 연결
   - 더 많은 예약 상세 표시 (아티스트, 서비스, 금액)
   - "베스트 아티스트" 추천 구현

2. **예약 상세에 행사 추가**:
   - 고객 BookingDetailScreen에 표시
   - ArtistBookingDetailScreen에 표시

3. **서비스 유형 표시 추가**:
   - 예약 상세에 헤어/메이크업/콤보 표시

### 13.4 낮은 우선순위 (정리)

1. **생년 제거 또는 구현**:
   - 나이 인증/제한 추가하거나
   - 회원가입 폼에서 제거

2. **서비스 관심사 제거 또는 구현**:
   - 아티스트 추천에 사용하거나
   - 온보딩에서 제거

3. **고객 프로필 완성 플로우 고려**:
   - 고객에게 피부 타입, 모발 타입, 선호도 추가 요청
   - 이 데이터를 아티스트에게 제공

---

## 부록 A: 데이터베이스 스키마 참조

### Users 테이블
```
users {
  id, email, passwordHash, name, phoneNumber, phoneVerified,
  role, profileImageUrl, birthYear, gender, language, timezone,
  notificationPreferences, isActive, isVerified, isBanned,
  onboardingCompleted, tokenVersion, sessionVersion, createdAt, updatedAt
}
```

### Artist Profiles 테이블
```
artistProfiles {
  id, userId, stageName, bio, specialties, yearsExperience,
  businessRegistrationNumber, businessVerified, licenses, certifications,
  serviceRadiusKm, primaryLocation, serviceAreas, workingHours,
  bufferTimeMinutes, advanceBookingDays, services, packages, travelFee,
  portfolioImages, beforeAfterSets, featuredWork, averageRating, totalReviews,
  responseTimeMinutes, verificationStatus, backgroundCheckCompleted,
  backgroundCheckDate, insuranceVerified, bankAccount, taxId,
  isAcceptingBookings, reviewedBy, reviewedAt, createdAt, updatedAt, verifiedAt
}
```

### Customer Profiles 테이블 (대부분 미사용)
```
customerProfiles {
  id, userId, skinType, skinTone, hairType, hairLength,
  allergies, sensitivities, medicalNotes, preferredStyles, favoriteArtists,
  genderPreference, primaryAddress, savedAddresses, totalBookings,
  completedBookings, cancelledBookings, averageRatingGiven, createdAt, updatedAt
}
```

### Bookings 테이블
```
bookings {
  id, bookingNumber, customerId, artistId, serviceType, occasion,
  services, scheduledDate, scheduledStartTime, scheduledEndTime,
  totalDurationMinutes, totalAmount, status, serviceLocation, address,
  locationType, locationNotes, referenceImages, specialRequests,
  timezone, paymentStatus, statusHistory, completedAt, completedBy,
  createdAt, updatedAt
}
```

### Onboarding Responses 테이블
```
onboarding_responses {
  id, userId, flowId, flowVersion, variantId, stepKey,
  response (JSONB), version, isCompletedStep, createdAt, updatedAt
}
```

---

## 부록 B: 기능 플래그

| 플래그 | 목적 | 값 |
|--------|------|-----|
| `EXPO_PUBLIC_SHOW_CUSTOMER_ONBOARDING` | 고객 온보딩 플로우 활성화 | 'true' / 'false' |
| `EXPO_PUBLIC_ONBOARDING_INPUT_TYPE` | 연예인 입력 방식 | 'idol_dropdown' / 기본값 |
| `USE_DEV_LOGIN` | 개발 로그인 화면 사용 | true / false |

---

## 부록 C: 네비게이션 구조

```
앱 루트
├─ [미인증]
│  ├─ Login
│  ├─ Signup
│  ├─ SignupConfirmation
│  └─ ArtistSignup
│
├─ [아티스트 - 프로필 미완성]
│  └─ ArtistOnboarding (4단계)
│
├─ [아티스트 - 심사 대기]
│  └─ ArtistPending
│
├─ [아티스트 - 승인됨]
│  ├─ ArtistBookingsList
│  ├─ ArtistBookingDetail
│  ├─ ArtistReviews
│  ├─ ChatsList / Chat
│  └─ NotificationInbox
│
├─ [고객 - 온보딩 필요]
│  ├─ OnboardingFlow
│  └─ OnboardingServices
│
└─ [고객 - 승인됨]
   ├─ Home
   ├─ BookingFlow (다단계)
   ├─ BookingsList / BookingDetail
   ├─ ReviewSubmission / MyReviews
   ├─ ArtistProfile
   ├─ ChatsList / Chat
   └─ NotificationInbox
```
