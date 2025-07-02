# 🚀 School Management System - Production Deployment Guide

## 📋 **Prerequisites**

- Node.js 18+ installed on server
- MongoDB database (local or cloud)
- Domain name and SSL certificate (recommended)

## 🔧 **Environment Configuration**

### **1. Backend Environment (.env)**

Create `backend/.env` file:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/school-management
JWT_SECRET=your-super-secret-jwt-key-here
```

### **2. Mobile App Environment**

Update `mobile-app/config/environment.js`:

```javascript
production: {
  API_BASE_URL: "https://your-domain.com/api", // Replace with your actual domain
  APP_NAME: "School Management",
}
```

### **3. Frontend Environment**

Update `frontend/src/config/environment.js` (already configured to use relative URLs in production)

## 🏗️ **Build & Deploy Process**

### **Step 1: Build Frontend**

```bash
cd frontend
npm install
npm run build
# This creates frontend/dist folder
```

### **Step 2: Prepare Backend**

```bash
cd backend
npm install
```

### **Step 3: Deploy using Backend Scripts**

```bash
cd backend
npm run deploy
# This builds frontend and starts production server
```

### **Alternative: Manual Deploy**

```bash
# Build frontend
cd frontend && npm run build && cd ..

# Start backend in production
cd backend
NODE_ENV=production npm start
```

## 🌐 **Server Configuration**

### **Nginx Configuration (Recommended)**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend static files
    location / {
        try_files $uri $uri/ @backend;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Fallback to backend for React routing
    location @backend {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **Direct Node.js Server (Alternative)**

If not using Nginx, the backend serves everything:

```bash
cd backend
NODE_ENV=production PORT=80 npm start
```

## 📱 **Mobile App Deployment**

### **For Development Testing:**

1. Update `mobile-app/config/environment.js` with your server URL
2. Run: `cd mobile-app && npx expo start`
3. Scan QR code with Expo Go

### **For Production App:**

1. Build APK/IPA using Expo Build Service:

```bash
cd mobile-app
npx expo build:android  # For Android
npx expo build:ios      # For iOS
```

## 🗄️ **Database Setup**

### **Create Admin User in Production:**

```bash
cd backend
node scripts/createAdmin.js
```

- **Email:** admin@school.com
- **Password:** admin123
- **Change default password after first login!**

## 🔧 **Quick Deployment Commands**

### **One-command deploy:**

```bash
# From project root
cd backend && npm run deploy
```

### **Check if everything is working:**

```bash
# Test API health
curl https://your-domain.com/api/health

# Test frontend
curl https://your-domain.com
```

## 📊 **Production URLs**

After deployment:

- **Admin Dashboard:** `https://your-domain.com`
- **API Endpoints:** `https://your-domain.com/api/*`
- **Health Check:** `https://your-domain.com/api/health`

## 🔐 **Security Recommendations**

1. **Change default admin password**
2. **Use strong JWT secret**
3. **Enable HTTPS with SSL certificate**
4. **Configure firewall to only allow necessary ports**
5. **Regular database backups**
6. **Monitor server logs**

## 🐛 **Troubleshooting**

### **Common Issues:**

- **API not accessible:** Check CORS settings and firewall
- **Frontend not loading:** Ensure `dist` folder is built and served
- **Mobile app connection failed:** Verify API_BASE_URL in environment config
- **Database connection:** Check MongoDB URI and network access

### **Logs:**

```bash
# Backend logs
cd backend && npm start

# Check if frontend is built
ls -la frontend/dist
```

## 🔄 **Update Process**

1. **Pull latest code**
2. **Rebuild frontend:** `cd frontend && npm run build`
3. **Restart backend:** `cd backend && npm start`
4. **Update mobile app** with new server URL if changed

---

## 🎯 **Ready for Production!**

Your School Management System will be accessible at your domain with:

- ✅ Admin dashboard for user management
- ✅ Mobile app for student/teacher/parent registration
- ✅ Complete approval workflow
- ✅ Scalable and secure architecture
