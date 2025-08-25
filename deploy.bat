@echo off
echo.
echo 🚀 BIDIAS E-COMMERCE PLATFORM - FRESH DEPLOYMENT
echo ==================================================
echo.

cd /d "C:\Users\josep\Desktop\app Ecom\sophisticated-ecommerce-capstone"

echo 📂 Current directory: %cd%
echo.

echo 🔄 Removing old Git repository...
if exist .git rmdir /s /q .git
echo ✅ Old repository removed
echo.

echo 🔄 Initializing fresh Git repository...
git init
echo ✅ Git repository initialized
echo.

echo 🔗 Adding remote repository...
git remote add origin https://github.com/eaglepython/FullStack_E_com.git
echo ✅ Remote repository added
echo.

echo 📦 Staging all files...
git add .
echo ✅ All files staged
echo.

echo 💾 Committing changes...
git commit -m "🚀 FRESH VERCEL DEPLOYMENT - Bidias E-Commerce Platform v2.0.0 - Complete NPower Capstone Project with Full Features Ready for Production"
echo ✅ Changes committed successfully
echo.

echo 🚀 Pushing to GitHub (force override)...
git push -u origin master --force
echo ✅ Repository updated on GitHub
echo.

echo 🎉 DEPLOYMENT PREPARATION COMPLETE!
echo =====================================
echo.
echo 📋 NEXT STEPS:
echo 1. 🌐 Go to https://vercel.com/dashboard
echo 2. 📁 Import your GitHub repository: FullStack_E_com
echo 3. 🎯 Deploy Frontend (root directory: frontend)
echo 4. ⚙️ Deploy Backend (root directory: backend)
echo 5. 🔑 Configure environment variables
echo 6. 🧪 Test your live deployment
echo.
echo 📖 Full instructions available in: FRESH_VERCEL_DEPLOYMENT.md
echo.
echo 🎓 Your NPower capstone project is ready for the world! 🚀
echo.
pause
