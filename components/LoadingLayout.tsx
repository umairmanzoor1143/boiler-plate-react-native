import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

interface LoadingLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  backgroundColor?: string;
}

 function LoadingLayout({ 
  children, 
  loading = false, 
  backgroundColor = 'rgba(255, 255, 255, 0.8)' 
}: LoadingLayoutProps) {
  return (
    <View style={styles.container}>
      {children}
      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor }]}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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