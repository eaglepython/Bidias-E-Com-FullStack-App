@echo off
echo.
echo ========================================
echo 🚀 DEPLOYING TO NEW REPOSITORY
echo ========================================
echo.
echo Repository: Bidias-E-Com-FullStack-App
echo URL: https://github.com/eaglepython/Bidias-E-Com-FullStack-App.git
echo.

cd /d "C:\Users\josep\Desktop\app Ecom\sophisticated-ecommerce-capstone"

echo 📁 Current directory: %CD%
echo.

echo 🔧 Removing old remote...
git remote remove origin 2>nul
echo.

echo 🔗 Adding new remote repository...
git remote add origin https://github.com/eaglepython/Bidias-E-Com-FullStack-App.git
echo.

echo ✅ Verifying remote...
git remote -v
echo.

echo 📦 Adding all files...
git add .
echo.

echo 💾 Committing changes...
git commit -m "🚀 BIDIAS E-COMMERCE PLATFORM - Complete NPower Capstone Project

✅ COMPLETE FULL-STACK E-COMMERCE PLATFORM:
• Stripe Payment Integration with Working Test Cards (4242 4242 4242 4242)
• Buy Now Functionality for Direct Product-to-Checkout Flow
• Google & Facebook OAuth Social Authentication System
• AI Shopping Assistant with Smart Product Recommendations
• Real-time Chat System with WebSocket Support
• Professional Notification System with Material-UI Snackbars
• Mobile-Responsive Design Optimized for All Device Sizes
• Redis Caching System for High-Performance Data Access
• Email Notification System for Order Confirmations
• Advanced Search and Filtering with Category Support

🎓 NPOWER APP DEVELOPMENT PROGRAM CAPSTONE:
• Graduate Project Demonstrating Full-Stack Mastery
• Javier Guerra - Lead Instructor & Technical Mentor
• Casey Reyes - Programming Instructor & Project Guide
• Complete Professional Development Achievement

🔧 ENTERPRISE-GRADE TECHNICAL STACK:
• Frontend: React 18 + TypeScript + Material-UI + Next.js
• Backend: Node.js + Express.js + MongoDB + Mongoose ODM
• Authentication: NextAuth.js with OAuth & Email/Password
• Payments: Stripe API with Test & Production Support
• Database: MongoDB Atlas Cloud with Optimized Schemas
• Caching: Redis for Session Management & Performance
• Deployment: Vercel-Ready with Production Configuration

📚 COMPREHENSIVE PROJECT DOCUMENTATION:
• README.md - Complete Setup Guide & Feature Overview
• CHANGELOG.md - Detailed Version History & Updates
• DEPLOYMENT_CHECKLIST.md - Production Deployment Guide
• ERROR_FIXES.md - Complete Troubleshooting Solutions
• STRIPE_FIXES.md - Payment Integration Problem Resolution
• COMPLETION_STATUS.md - Final Project Achievement Status

🚀 PRODUCTION-READY DEPLOYMENT:
• Vercel Configuration Complete with Optimized Settings
• Environment Variables Configured for Production
• Frontend & Backend Builds Successfully Tested
• All E-Commerce Features Validated and Functional
• Payment System Tested with Official Stripe Test Cards
• OAuth Authentication Flows Fully Operational
• Database Connections Optimized for Cloud Deployment

💼 PROFESSIONAL PORTFOLIO PIECE:
This represents a complete, enterprise-grade e-commerce platform developed as the capstone project for the NPower App Development Program. Special recognition to instructors Javier Guerra and Casey Reyes for their expert guidance in creating this production-ready application that demonstrates mastery of modern full-stack web development technologies, best practices, and professional software engineering principles."
echo.

echo 🚀 Pushing to new repository...
git push -u origin master --force
echo.

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ SUCCESS: Code pushed to new repository!
    echo ========================================
    echo.
    echo 🔗 Repository URL: https://github.com/eaglepython/Bidias-E-Com-FullStack-App
    echo 🎯 Next Step: Deploy to Vercel using this new repository
    echo 📋 Vercel Project Name: bidias-ecom-fullstack-app
    echo.
    echo 🚀 Ready for Vercel deployment!
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ ERROR: Failed to push to repository
    echo ========================================
    echo.
    echo Please check your internet connection and try again.
    echo.
)

pause
