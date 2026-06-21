# 지인 배포용 앱 빌드 (Android + iPhone)

Expo Go 없이 **독립 앱**으로 설치할 수 있는 파일을 만드는 방법입니다.  
스토어 공개 출시는 하지 않습니다.

## GitHub Actions에서 APK 받기 (추천)

코드를 GitHub에 올린 뒤 Actions에서 APK를 받을 수 있습니다.

### 1. 코드 푸시

```cmd
git add .
git commit -m "Add GitHub Actions APK build"
git push origin main
```

### 2. Actions 실행

1. GitHub 저장소 → **Actions** 탭
2. **Build Android APK** 선택
3. **Run workflow** → **Run workflow**

`main` 브랜치에 push해도 자동으로 빌드됩니다.

### 3. APK 다운로드

1. 완료된 workflow run 클릭
2. 아래 **Artifacts** → **dday-gifticon-apk** 다운로드
3. 압축 풀고 **`app-release.apk`** → 폰에 설치

> 이전 `app-debug.apk`는 PC 서버 없이 실행되지 않습니다. **release APK**만 사용하세요.

**비용:** GitHub Actions 무료 한도 내 무료 (Expo 계정 불필요)

### EAS로 빌드 (선택)

**Build Android APK (EAS)** workflow 사용:

1. [expo.dev](https://expo.dev) → Access Tokens → 토큰 생성
2. GitHub 저장소 → **Settings** → **Secrets** → `EXPO_TOKEN` 추가
3. Actions → **Build Android APK (EAS)** → Run workflow

---

## 준비 (PC에서 직접 빌드할 때)

1. [expo.dev](https://expo.dev) 계정 생성
2. PC에서 로그인:

```cmd
cd C:\Users\rok\Projects\dday-gifticon
npx eas-cli login
```

3. Expo 프로젝트 연결 (최초 빌드 시 안내에 따라 진행):

```cmd
npx eas-cli build:configure
```

## Android — APK (지인에게 파일 전달)

```cmd
build-android.cmd
```

또는:

```cmd
npm.cmd run build:android
```

- 빌드 완료 후 [expo.dev](https://expo.dev) → Builds에서 **APK 다운로드**
- 카카오톡·이메일 등으로 APK 전달
- 지인: **알 수 없는 앱 설치** 허용 후 설치

**비용:** 무료 (EAS 무료 티어로 시작 가능)

## iPhone — 내부 배포

```cmd
build-ios.cmd
```

또는:

```cmd
npm.cmd run build:ios
```

- **Apple Developer Program ($99/년)** 필요
- 빌드 중 Apple 계정·인증서 설정 (EAS가 대부분 자동 처리)
- 완료 후 **TestFlight** 또는 EAS 내부 배포 링크로 지인 초대

**참고:** iOS는 Android처럼 APK 파일만 던져주는 방식이 불가능합니다.

## Android + iPhone 동시 빌드

```cmd
npm.cmd run build:all
```

## 앱 식별 정보

| 항목 | 값 |
|------|-----|
| Android package | `com.alicecode0813.ddaygifticon` |
| iOS bundle ID | `com.alicecode0813.ddaygifticon` |
| 버전 | 1.0.0 |

패키지명 변경이 필요하면 `app.json`의 `android.package` / `ios.bundleIdentifier`를 수정하세요.

## 버전 올릴 때

`app.json`에서:

- `version`: "1.0.1" 등
- `android.versionCode`: 2, 3, … (매 빌드 +1)
- `ios.buildNumber`: "2", "3", …

## 문제 해결

| 증상 | 해결 |
|------|------|
| Not logged in | `npx eas-cli login` |
| iOS credentials | EAS 안내에 따라 Apple Developer 로그인 |
| Android install blocked | 설정 → 보안 → 알 수 없는 출처 허용 |
