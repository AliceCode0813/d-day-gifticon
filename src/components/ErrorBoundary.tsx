import { Component, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>앱을 불러오지 못했어요</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Text style={styles.hint}>Expo Go를 최신 버전으로 업데이트한 뒤 다시 시도해 주세요.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  hint: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
});
