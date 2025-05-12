This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.


# Creating the release
cd android/app

## run to create sign key: 
      keytool -genkey -v -keystore android.keystore -alias androidkey -keyalg RSA -keysize 2048 -validity 10000
--> name and last name: farman ali 
--> password will be asked and other information : android
--> name of keystore file (my-release-key.keystore): android.keystore
--> file alias (my-release-key): androidkey

## to add sign in key edit android/app/build.gradle
--> changing password you inserted, and use alias as my-key-alias in place of androiddebugkey
   signingConfigs {
        release {
            storeFile file('android.keystore')
            storePassword 'android'
            keyAlias 'androidkey'
            keyPassword 'android'
        }
    }
and also change debug to release:
<!-- release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug -->
            to-->
            signingConfig signingConfigs.release -->

## versions handling
edit android/app/build.gradle

 defaultConfig {
        applicationId "com.irs"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }
    here change versionName and versionCode

## using library version handling
add first 
npm install react-native-version
first change the version in package.json file and then run command

react-native-version --never-amend

cd android
or 
./gradlew bundleRelease
./gradlew assembleRelease

location of apk:
file: android/app/build/outputs/apk/release/app-release.apk
path: android\app\build\outputs\apk\release

location of bundle file:
android\app\build\outputs\bundle\release

# port binding with backened
adb -s emulator-5554 forward tcp:8080 tcp:8080

# for changing the package name or renaming
npx react-native-rename 'name will be changed' -b 'new'
example:
npx react-native-rename 'simple math' -b 'com.notjustdev'

# autolinking issue
remove build generated folders