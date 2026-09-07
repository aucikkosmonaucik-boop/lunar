# Stripe ProGuard / R8 Rules
-dontwarn com.stripe.android.**
-keep class com.stripe.android.** { *; }
-dontwarn com.reactnativestripesdk.**
-keep class com.reactnativestripesdk.** { *; }
-dontwarn com.facebook.react.**
-keep class com.facebook.react.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

