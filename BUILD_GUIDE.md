# APK Build Guide for IRS System

This guide explains how to build a release APK for the IRS (Incident Reporting System) application.

## 📋 Prerequisites

Before building the APK, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Java Development Kit (JDK 17)**
   - Download: https://adoptium.net/
   - Set `JAVA_HOME` environment variable
   - Verify: `java --version`

3. **Android SDK**
   - Download Android Studio: https://developer.android.com/studio
   - Set `ANDROID_HOME` environment variable
   - Path should point to SDK location (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)

4. **Git** (optional but recommended)
   - Download: https://git-scm.com/

### Environment Variables Setup (Windows)

1. Open System Properties → Advanced → Environment Variables
2. Add/Update these variables:

```
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
```

3. Add to PATH:
```
%JAVA_HOME%\bin
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

## 🚀 Quick Start

### Option 1: Using the Build Script (Recommended)

#### For Windows:
```bash
# Navigate to project directory
cd c:\Users\Haier\Downloads\native_code\project\IRS

# Run the batch file
build-apk.bat
```

#### For Linux/Mac:
```bash
# Navigate to project directory
cd /path/to/IRS

# Make script executable
chmod +x build-apk.sh

# Run the script
./build-apk.sh
```

The script will:
1. ✅ Check all prerequisites
2. ✅ Configure environment variables (.env)
3. ✅ Install npm dependencies
4. ✅ Check/generate keystore
5. ✅ Clean previous builds (optional)
6. ✅ Build the release APK
7. ✅ Display SHA signatures for signing
8. ✅ Copy APK to `build_output` folder with timestamp

### Option 2: Manual Build

If you prefer to build manually:

```bash
# 1. Install dependencies
npm install

# 2. Navigate to android folder
cd android

# 3. Clean previous build (optional)
gradlew clean

# 4. Build release APK
gradlew assembleRelease

# 5. Find your APK at:
# android/app/build/outputs/apk/release/app-release.apk
```

## 🔧 Environment Configuration

The build script will prompt you to configure these variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `API_IP` | API server IP address | `10.0.2.2` |
| `API_KEY` | API authentication key | `your-api-key` |
| `API_PORT` | API server port | `8080` |
| `API_BASE_URL` | Complete API base URL | `http://0.0.0.0:8080` |

These values are stored in the `.env` file in the project root.

### Example .env file:
```properties
API_IP=10.0.2.2
API_KEY=your-api-key
API_PORT=8080
API_BASE_URL=http://159.198.70.84:8080
```

## 🔐 Keystore Information

The build uses a keystore for signing the APK:

- **Location**: `android/app/android.keystore`
- **Alias**: `androidkey`
- **Store Password**: `android`
- **Key Password**: `android`

### Important Notes:

⚠️ **For Production**: Generate a new keystore with strong passwords:

```bash
keytool -genkeypair -v \
  -keystore my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass <strong-password> \
  -keypass <strong-password>
```

**Keep your production keystore safe!** If you lose it, you cannot update your app on Google Play Store.

## 📱 APK Output

After a successful build:

- **Primary APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **Copy with timestamp**: `build_output/irsystem-release-YYYYMMDD_HHMMSS.apk`

## 🔑 SHA Signatures

The build script displays SHA-1 and SHA-256 signatures. You'll need these for:

1. **Firebase Authentication**
   - Go to Firebase Console → Project Settings → Add SHA certificates

2. **Google Maps API**
   - Go to Google Cloud Console → Credentials → Create Android key

3. **Facebook SDK**
   - Go to Facebook Developer Console → Settings → Add Android key hashes

4. **Other OAuth Providers**

### Get SHA signatures manually:

```bash
keytool -list -v -keystore android/app/android.keystore -storepass android
```

## 📦 App Details

Current build configuration:

- **Package Name**: `com.irsystem`
- **Version Code**: `4`
- **Version Name**: `4.0`
- **Min SDK**: As defined in `android/build.gradle`
- **Target SDK**: As defined in `android/build.gradle`

## 🐛 Troubleshooting

### Common Issues

#### 1. "JAVA_HOME is not set"
```bash
# Windows
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x

# Linux/Mac
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
```

#### 2. "ANDROID_HOME is not set"
```bash
# Windows
set ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk

# Linux/Mac
export ANDROID_HOME=~/Android/Sdk
```

#### 3. "SDK location not found"
Create `android/local.properties`:
```properties
sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

#### 4. "Execution failed for task ':app:processReleaseResources'"
```bash
# Clean the build
cd android
gradlew clean
cd ..

# Rebuild
cd android
gradlew assembleRelease
```

#### 5. "Unable to find bundletool.jar"
Update React Native version or install bundletool manually.

#### 6. Build fails with memory error
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

## 🎯 Testing the APK

### Install on Physical Device

1. **Enable Developer Mode** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Settings → Developer Options → USB Debugging

3. **Install APK**:
   ```bash
   adb install build_output/irsystem-release-*.apk
   ```

### Install via File Transfer

1. Copy APK to device
2. Open file manager on device
3. Tap the APK file
4. Allow installation from unknown sources if prompted
5. Install

## 🚢 Distribution

### Internal Testing
- Share APK directly with testers
- Use Firebase App Distribution
- Use Google Play Internal Testing

### Production Release
1. Generate production keystore (see Keystore section)
2. Update `android/app/build.gradle` with production signing config
3. Build release APK
4. Create app listing on Google Play Console
5. Upload APK/AAB to Google Play Console
6. Complete store listing
7. Submit for review

### Generate AAB (Android App Bundle) for Play Store

```bash
cd android
gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/signed-apk-android)
- [Android Developer Guide](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console](https://play.google.com/console)

## 🔄 Version Management

To update app version:

Edit `android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 5        // Increment this
    versionName "5.0"    // Update version string
}
```

## 📝 Build Checklist

Before building for production:

- [ ] Update version code and name
- [ ] Configure production API endpoints in `.env`
- [ ] Generate production keystore
- [ ] Update signing config in `build.gradle`
- [ ] Test on multiple devices
- [ ] Check app permissions
- [ ] Verify all features work
- [ ] Remove debug logs
- [ ] Enable ProGuard/R8 (already enabled in release)
- [ ] Test offline functionality
- [ ] Verify data persistence
- [ ] Check crash reporting setup

## 💡 Pro Tips

1. **Keep backups** of your keystore file
2. **Document** keystore passwords securely
3. **Test thoroughly** before release
4. **Use AAB format** for Play Store (smaller download size)
5. **Enable ProGuard** to reduce APK size
6. **Monitor crash reports** after release
7. **Use version control** for all code changes

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review React Native documentation
- Check project README.md
- Contact development team

---

**Last Updated**: October 26, 2025
**App Version**: 4.0
**Build Script Version**: 1.0
