# 🏗️ EAS Build Checklist for School Management Mobile App

## ✅ **Pre-Build Checklist**

### **1. Environment Configuration**

- [ ] Verify `config/environment.js` has correct production API URL
- [ ] Ensure API URL is: `https://schoolmangement.aiiventure.com/api`
- [ ] Confirm environment is set to "production"

### **2. Dependencies Check**

- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Check for any missing or conflicting packages

### **3. Code Verification**

- [ ] Test app locally with `npx expo start`
- [ ] Verify registration functionality works
- [ ] Check network requests are going to correct API

### **4. EAS Configuration**

- [ ] Ensure `eas.json` is properly configured
- [ ] Verify build profiles are set correctly

## 🚀 **Build Commands**

### **Clean Build Process:**

```bash
# 1. Clean npm cache
npm cache clean --force

# 2. Remove node_modules and reinstall
rm -rf node_modules
npm install

# 3. Start EAS build
npx eas build -p android --clear-cache
```

### **If Build Fails:**

```bash
# Try with more verbose logging
npx eas build -p android --clear-cache --verbose

# Or try iOS build
npx eas build -p ios --clear-cache
```

## 🔧 **Common Issues & Solutions**

### **Module Resolution Errors:**

- Ensure all imports use correct paths
- Check that `config/index.js` exists
- Verify `metro.config.js` is present

### **Environment Variables:**

- Production API URL: `https://schoolmangement.aiiventure.com/api`
- Environment mode: `"production"`

### **Network Issues:**

- Verify server is accessible from mobile devices
- Check API endpoints are working
- Test with curl: `curl https://schoolmangement.aiiventure.com/api/health`

## 📱 **After Successful Build**

### **Testing:**

1. Install APK on Android device
2. Test registration flow
3. Verify admin approval workflow works
4. Check all API calls are working

### **Distribution:**

1. Upload to Google Play Store (internal testing first)
2. Share with stakeholders for testing
3. Monitor for any issues or crashes
