import React from 'react';
import { View, Text } from '@tarojs/components';

const Index: React.FC = () => {
  return (
    <View style={{ padding: '20px', textAlign: 'center' }}>
      <Text>🎯 追影小程序</Text>
      <View style={{ marginTop: '20px' }}>
        <Text>应用正常运行！</Text>
      </View>
    </View>
  );
};

export default Index;
