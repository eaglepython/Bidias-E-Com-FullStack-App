@echo off
echo "=== REPOSITORY OVERRIDE SCRIPT ==="
echo.

cd /d "C:\Users\josep\Desktop\app Ecom\sophisticated-ecommerce-capstone"
echo "Current directory: %cd%"
echo.

echo "=== Initializing Git Repository ==="
git init
echo.

echo "=== Adding Remote Origin ==="
git remote add origin https://github.com/eaglepython/FullStack_E_com.git
git remote -v
echo.

echo "=== Adding All Files ==="
git add .
echo.

echo "=== Committing All Changes ==="
git commit -m "🚀 COMPLETE REPOSITORY OVERRIDE - Bidias E-Commerce Platform v2.0.0 - NPower Capstone Project with Full Features"
echo.

echo "=== Force Pushing to Override Repository ==="
git push -u origin master --force
echo.

echo "=== REPOSITORY OVERRIDE COMPLETE ==="
pause
