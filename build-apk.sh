#!/bin/bash

# IRS System - APK Build Script
# This script builds a release APK for the IRS (Incident Reporting System) app

set -e  # Exit on error

echo "======================================"
echo "  IRS System - APK Build Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values from .env
DEFAULT_API_IP="10.0.2.2"
DEFAULT_API_KEY="your-api-key"
DEFAULT_API_PORT="8080"
DEFAULT_API_BASE_URL="http://0.0.0.0:8080"

# Function to read current .env values
read_env_file() {
    if [ -f ".env" ]; then
        echo -e "${GREEN}Found existing .env file${NC}"
        source .env
    else
        echo -e "${YELLOW}No .env file found. Will create one.${NC}"
    fi
}

# Function to prompt for environment variables
configure_env() {
    echo ""
    echo "======================================"
    echo "  Environment Configuration"
    echo "======================================"
    echo ""
    echo "Press ENTER to use default values shown in [brackets]"
    echo ""

    # API_IP
    read -p "Enter API IP [${API_IP:-$DEFAULT_API_IP}]: " input_api_ip
    API_IP="${input_api_ip:-${API_IP:-$DEFAULT_API_IP}}"

    # API_KEY
    read -p "Enter API Key [${API_KEY:-$DEFAULT_API_KEY}]: " input_api_key
    API_KEY="${input_api_key:-${API_KEY:-$DEFAULT_API_KEY}}"

    # API_PORT
    read -p "Enter API Port [${API_PORT:-$DEFAULT_API_PORT}]: " input_api_port
    API_PORT="${input_api_port:-${API_PORT:-$DEFAULT_API_PORT}}"

    # API_BASE_URL
    read -p "Enter API Base URL [${API_BASE_URL:-$DEFAULT_API_BASE_URL}]: " input_api_base_url
    API_BASE_URL="${input_api_base_url:-${API_BASE_URL:-$DEFAULT_API_BASE_URL}}"

    # Write to .env file
    echo ""
    echo -e "${GREEN}Writing configuration to .env file...${NC}"
    cat > .env << EOF
API_IP=$API_IP
API_KEY=$API_KEY
API_PORT=$API_PORT
API_BASE_URL=$API_BASE_URL
EOF
    echo -e "${GREEN}.env file updated successfully!${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    echo ""
    echo "======================================"
    echo "  Checking Prerequisites"
    echo "======================================"
    echo ""

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ npm: $(npm --version)${NC}"

    # Check if Java is installed
    if ! command -v java &> /dev/null; then
        echo -e "${RED}Error: Java is not installed${NC}"
        echo "Please install JDK 17 or higher"
        exit 1
    fi
    echo -e "${GREEN}✓ Java: $(java --version | head -n 1)${NC}"

    # Check if Android SDK is set up
    if [ -z "$ANDROID_HOME" ]; then
        echo -e "${YELLOW}Warning: ANDROID_HOME is not set${NC}"
        echo "Please set ANDROID_HOME environment variable"
    else
        echo -e "${GREEN}✓ ANDROID_HOME: $ANDROID_HOME${NC}"
    fi
}

# Function to install dependencies
install_dependencies() {
    echo ""
    echo "======================================"
    echo "  Installing Dependencies"
    echo "======================================"
    echo ""
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing npm dependencies...${NC}"
        npm install
        echo -e "${GREEN}✓ Dependencies installed${NC}"
    else
        echo -e "${GREEN}✓ node_modules already exists${NC}"
        read -p "Do you want to reinstall dependencies? (y/N): " reinstall
        if [[ $reinstall =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Reinstalling dependencies...${NC}"
            rm -rf node_modules
            npm install
            echo -e "${GREEN}✓ Dependencies reinstalled${NC}"
        fi
    fi
}

# Function to clean build
clean_build() {
    echo ""
    echo "======================================"
    echo "  Cleaning Previous Build"
    echo "======================================"
    echo ""
    
    cd android
    
    if [ -d "app/build" ]; then
        echo -e "${YELLOW}Cleaning previous build...${NC}"
        ./gradlew clean
        echo -e "${GREEN}✓ Build cleaned${NC}"
    else
        echo -e "${GREEN}✓ No previous build to clean${NC}"
    fi
    
    cd ..
}

# Function to check keystore
check_keystore() {
    echo ""
    echo "======================================"
    echo "  Checking Keystore"
    echo "======================================"
    echo ""
    
    KEYSTORE_PATH="android/app/android.keystore"
    
    if [ -f "$KEYSTORE_PATH" ]; then
        echo -e "${GREEN}✓ Keystore found at $KEYSTORE_PATH${NC}"
    else
        echo -e "${YELLOW}Keystore not found. Generating new keystore...${NC}"
        
        # Generate keystore
        keytool -genkeypair \
            -v \
            -keystore "$KEYSTORE_PATH" \
            -alias androidkey \
            -keyalg RSA \
            -keysize 2048 \
            -validity 10000 \
            -storepass android \
            -keypass android \
            -dname "CN=IRS System, OU=Development, O=IRS, L=City, S=State, C=PK"
        
        echo -e "${GREEN}✓ Keystore generated successfully${NC}"
    fi
    
    # Display keystore info
    echo ""
    echo "Keystore Information:"
    keytool -list -v -keystore "$KEYSTORE_PATH" -storepass android | grep -A 5 "Alias name:"
}

# Function to build APK
build_apk() {
    echo ""
    echo "======================================"
    echo "  Building Release APK"
    echo "======================================"
    echo ""
    
    cd android
    
    echo -e "${YELLOW}Building release APK...${NC}"
    echo "This may take a few minutes..."
    echo ""
    
    ./gradlew assembleRelease
    
    cd ..
    
    echo ""
    echo -e "${GREEN}✓ APK built successfully!${NC}"
}

# Function to locate and display APK info
display_apk_info() {
    echo ""
    echo "======================================"
    echo "  Build Complete!"
    echo "======================================"
    echo ""
    
    APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
    
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo -e "${GREEN}APK Location:${NC} $APK_PATH"
        echo -e "${GREEN}APK Size:${NC} $APK_SIZE"
        echo ""
        
        # Create a copy with timestamp
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        OUTPUT_DIR="build_output"
        mkdir -p "$OUTPUT_DIR"
        OUTPUT_APK="$OUTPUT_DIR/irsystem-release-$TIMESTAMP.apk"
        cp "$APK_PATH" "$OUTPUT_APK"
        
        echo -e "${GREEN}APK copied to:${NC} $OUTPUT_APK"
        echo ""
        
        # Get APK details using aapt (if available)
        if command -v aapt &> /dev/null; then
            echo "APK Details:"
            aapt dump badging "$APK_PATH" | grep -E "package:|sdkVersion:|targetSdkVersion:|versionCode|versionName"
        fi
    else
        echo -e "${RED}Error: APK not found at expected location${NC}"
        exit 1
    fi
}

# Function to get SHA signatures
get_sha_signatures() {
    echo ""
    echo "======================================"
    echo "  SHA Signatures"
    echo "======================================"
    echo ""
    
    KEYSTORE_PATH="android/app/android.keystore"
    
    echo "SHA-1 Signature:"
    keytool -list -v -keystore "$KEYSTORE_PATH" -storepass android | grep SHA1: | awk '{print $2}'
    echo ""
    
    echo "SHA-256 Signature:"
    keytool -list -v -keystore "$KEYSTORE_PATH" -storepass android | grep SHA256: | awk '{print $2}'
    echo ""
    
    echo -e "${YELLOW}Note: These signatures are needed for:${NC}"
    echo "  - Firebase authentication"
    echo "  - Google Maps API"
    echo "  - Facebook SDK"
    echo "  - Other OAuth providers"
}

# Main execution flow
main() {
    # Read existing .env
    read_env_file
    
    # Ask if user wants to configure environment
    echo ""
    read -p "Do you want to configure environment variables? (Y/n): " configure
    if [[ ! $configure =~ ^[Nn]$ ]]; then
        configure_env
    else
        echo -e "${GREEN}Using existing .env configuration${NC}"
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_dependencies
    
    # Ask if user wants to clean build
    echo ""
    read -p "Do you want to clean previous build? (Y/n): " clean
    if [[ ! $clean =~ ^[Nn]$ ]]; then
        clean_build
    fi
    
    # Check/generate keystore
    check_keystore
    
    # Build APK
    build_apk
    
    # Display APK info
    display_apk_info
    
    # Get SHA signatures
    get_sha_signatures
    
    echo ""
    echo -e "${GREEN}======================================"
    echo "  Build Process Completed Successfully!"
    echo "======================================${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Test the APK on a device"
    echo "  2. Upload to Google Play Console (for production)"
    echo "  3. Distribute via internal testing channels"
    echo ""
}

# Run main function
main
