import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context';


 function LoadingLayout({ 
  children, 
  loading = false, 
  backgroundColor = 'rgba(255, 255, 255, 0.8)' 
}: {
  children: React.ReactNode;
  loading?: boolean;
  backgroundColor?: string;
}) {
  const { initialLoading } = useAuth();
  return (
    <ThemedView style={styles.container}>
     {/* <SafeAreaView 
      style={styles.safeAreaView} 
    > */}
      {children}
      {/* </SafeAreaView> */}
      {loading || initialLoading && (
        <ThemedView style={[styles.loadingOverlay, { backgroundColor }]}>
          <ActivityIndicator size="large" />
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }
}); 
export default LoadingLayout;