import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        return web;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyC19fLh5mCtZxEaLxEilokK2BJ46aQ31tM',
    appId: '1:651131285123:web:d734bbc9d3c41aa76df5b6',
    messagingSenderId: '651131285123',
    projectId: 'lunar-store-ecef4',
    authDomain: 'lunar-store-ecef4.firebaseapp.com',
    storageBucket: 'lunar-store-ecef4.firebasestorage.app',
    measurementId: 'G-BPZBMVHFMK',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyC19fLh5mCtZxEaLxEilokK2BJ46aQ31tM',
    appId: '1:651131285123:android:1e0b9feaf1649f4e6df5b6',
    messagingSenderId: '651131285123',
    projectId: 'lunar-store-ecef4',
    storageBucket: 'lunar-store-ecef4.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyC19fLh5mCtZxEaLxEilokK2BJ46aQ31tM',
    appId: '1:651131285123:ios:1e0b9feaf1649f4e6df5b6',
    messagingSenderId: '651131285123',
    projectId: 'lunar-store-ecef4',
    storageBucket: 'lunar-store-ecef4.firebasestorage.app',
    iosBundleId: 'com.lunar.store.lunar_mobile',
  );
}
