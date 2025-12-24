import { ImageSourcePropType } from 'react-native';

declare module '@react-native-community/netinfo';
declare module 'socket.io-client';
declare module 'react-native-gifted-chat';
declare module 'react-native-image-picker';
declare module 'expo-image-manipulator';

// Image asset declarations
declare module '*.png' {
  const value: ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  const value: ImageSourcePropType;
  export default value;
}

declare module '*.jpeg' {
  const value: ImageSourcePropType;
  export default value;
}

declare module '*.gif' {
  const value: ImageSourcePropType;
  export default value;
}

declare module '*.webp' {
  const value: ImageSourcePropType;
  export default value;
}

declare module '*.svg' {
  const value: ImageSourcePropType;
  export default value;
}
