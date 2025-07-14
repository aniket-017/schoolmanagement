#!/bin/bash

echo "🚀 Installing Attendance Management Dependencies..."
echo ""

# Install additional dependencies for attendance management
echo "📦 Installing @react-native-community/datetimepicker..."
npx expo install @react-native-community/datetimepicker

echo "📦 Installing @react-native-picker/picker..."
npx expo install @react-native-picker/picker

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "📱 To start the mobile app:"
echo "   npm start"
echo ""
echo "🔧 Make sure your backend server is running before testing attendance features."
echo "" 