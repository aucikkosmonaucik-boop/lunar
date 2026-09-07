# Stripe ProGuard / R8 Rules
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivity$g
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter$Args
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter$Error
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningActivityStarter
-dontwarn com.stripe.android.pushProvisioning.PushProvisioningEphemeralKeyProvider
-dontwarn com.stripe.android.**
-keep class com.stripe.** { *; }
-dontwarn com.reactnativestripesdk.**
-keep class com.reactnativestripesdk.** { *; }
-dontwarn com.facebook.react.**
-keep class com.facebook.react.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

