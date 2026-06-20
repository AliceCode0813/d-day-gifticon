# 디데이기프티콘

받은 기프티콘 사진을 등록하고, 만료일 기준 D-Day 순으로 정렬해 보여주는 React Native(Expo) 앱입니다.

## 주요 기능

- 기프티콘 등록 (카메라 / 갤러리)
- **OCR 자동 인식** (상품명, 만료일, D-Day 추정)
- 만료일 D-Day 표시 및 임박 순 정렬
- **달력 탭**에서 만료일별 기프티콘 확인
- **알림 탭**에서 시점·시간 설정 (달력 앱 스타일)
- 사진 탭 시 전체 화면 확대
- 만료 알림 (시점·시간 사용자 설정)
- 검색, 사용 완료, 삭제

## 실행 방법 (Android)

### 가장 쉬운 방법

프로젝트 폴더에서 **`start-android.cmd`** 파일을 **더블클릭**

- PowerShell 오류 없음 (`npm.cmd` 사용)
- **다른 Wi-Fi / LTE**에서도 연결 가능 (Cloudflare 터널)
- PC와 폰이 **같은 Wi-Fi**면 `npm.cmd run start:lan` 도 가능

### USB로 연결 (가장 안정적, Android)

폰을 USB로 PC에 연결하고 USB 디버깅을 켠 뒤:

```cmd
start-usb.cmd
```

또는:

```cmd
npm.cmd run start:usb
```

Wi-Fi/LTE와 상관없이 USB로 Metro에 연결됩니다.

### 수동 실행 (다른 Wi-Fi / LTE)

```cmd
cd C:\Users\rok\Projects\dday-gifticon
npm.cmd run start:android
```

같은 Wi-Fi일 때:

```cmd
npm.cmd run start:lan
```

PowerShell에서 `npm` 오류가 나면 **`npm.cmd`** 를 사용하세요.

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### 폰에서 열기

1. Play Store에서 **Expo Go** 설치 및 **최신 업데이트** (SDK 54)
2. PC에서 서버 실행 후 **`Using Expo Go`** 확인
3. **`c`** 키 → QR 코드 표시
4. Expo Go → **Scan QR code**

### 스캔 오류가 날 때

| 증상 | 해결 |
|------|------|
| `development build` / `expo-dev-client` 오류 | `Ctrl+C` 후 `npm.cmd run start:android` 다시 실행 |
| Could not connect / 같은 Wi-Fi 아님 | `start-android.cmd` 또는 `start-usb.cmd` (USB) |
| `Port 8083 is being used` | 다른 터미널에서 Expo 종료(`Ctrl+C`) 후 다시 실행 |
| QR이 안 열림 | Expo Go 최신 버전 설치, 터미널에서 `c` 키로 QR 다시 표시 |
| 로딩만 되다 실패 | USB 연결(`start-usb.cmd`) 시도, 또는 PC 방화벽에서 Node 허용 |

## GitHub 연동

1. GitHub에서 새 저장소 생성 (예: `dday-gifticon`)
2. 원격 저장소 연결:

```bash
git remote add origin https://github.com/<사용자명>/dday-gifticon.git
git branch -M main
git push -u origin main
```

## 스토어 / 지인 배포

**GitHub Actions에서 APK 받기:** [BUILD.md](./BUILD.md) → Actions → **Build Android APK** → Artifacts

- Android: `build-android.cmd` 또는 GitHub Actions
- iPhone: `build-ios.cmd` → Apple Developer ($99/년)

## 기술 스택

- Expo SDK 54 (Play Store Expo Go 호환)
- React Native
- TypeScript
- AsyncStorage (로컬 저장)
- Expo Notifications (만료 알림)
