# 디데이기프티콘

받은 기프티콘 사진을 등록하고, 만료일 기준 D-Day 순으로 정렬해 보여주는 React Native(Expo) 앱입니다.

## 주요 기능

- 기프티콘 등록 (카메라 / 갤러리)
- 만료일 D-Day 표시 및 임박 순 정렬
- 사진 탭 시 전체 화면 확대
- D-7, D-3, D-1, D-Day 푸시 알림
- 검색, 사용 완료, 삭제

## 실행 방법

```bash
npm install
npm start
```

- Android: `npm run android` 또는 Expo Go 앱에서 QR 스캔
- iOS: `npm run ios` (macOS 필요) 또는 Expo Go
- Web: `npm run web`

## GitHub 연동

1. GitHub에서 새 저장소 생성 (예: `dday-gifticon`)
2. 원격 저장소 연결:

```bash
git remote add origin https://github.com/<사용자명>/dday-gifticon.git
git branch -M main
git push -u origin main
```

## 스토어 배포 (참고)

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)로 Android/iOS 빌드
- Google Play / App Store 개발자 계정 필요

## 기술 스택

- Expo SDK 56
- React Native
- TypeScript
- AsyncStorage (로컬 저장)
- Expo Notifications (만료 알림)
