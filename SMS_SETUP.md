# SMS Notifications Setup Guide

This guide explains how to configure SMS notifications for PettyFitness 22 bookings and plan selections.

## Overview

When users book a session or select a plan, an SMS notification is automatically sent to **9804216801** with the user's information.

## Features

- 📱 **Booking Notifications**: Sent when users click "Book With Me"
- 📋 **Plan Selection Notifications**: Sent when users select a training plan
- 📝 **User Information Collection**: Collects name, email, and optional phone number
- ✅ **Graceful Fallback**: App continues to work even if SMS service is unavailable

## Setup Instructions

### 1. Create a Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account (includes $15 credit)
3. Verify your email and phone number

### 2. Get Your Twilio Credentials

After signing up, you'll need three pieces of information from your Twilio Console:

1. **Account SID**: Found on your Twilio Console Dashboard
2. **Auth Token**: Found on your Twilio Console Dashboard (click "Show" to reveal)
3. **Twilio Phone Number**: Get a free phone number from Twilio Console → Phone Numbers → Buy a Number

### 3. Configure Environment Variables on Vercel

1. Go to your Vercel project: [https://vercel.com/harvfis-projects/pettyfitness-22-ecosystem](https://vercel.com/harvfis-projects/pettyfitness-22-ecosystem)
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | From Twilio Console |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | From Twilio Console (keep secret!) |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number | Format: +1234567890 |
| `TRAINER_PHONE_NUMBER` | 9804216801 | Already set (can be changed) |
| `GEMINI_API_KEY` | Your Gemini API key | For AI features (optional) |

4. Click **Save** for each variable

### 4. Redeploy the Application

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Wait for the deployment to complete

## Testing

### Test Locally (Optional)

1. Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Twilio credentials in `.env.local`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Test the booking flow:
   - Click "Book With Me" button
   - Fill in the form with your information
   - Submit and check if SMS is received

### Test on Vercel

1. Visit [https://pettyfitness-22-ecosystem.vercel.app](https://pettyfitness-22-ecosystem.vercel.app)
2. Click "Book With Me" or select a plan
3. Fill in the booking form
4. Submit and verify SMS is received at 9804216801

## SMS Message Format

### Booking Notification
```
🏋️ NEW BOOKING REQUEST

Client: John Doe
Email: john@example.com
Phone: (555) 123-4567

Time: 1/6/2026, 1:30:00 AM
```

### Plan Selection Notification
```
🏋️ NEW PLAN SELECTED

Client: John Doe
Email: john@example.com
Phone: (555) 123-4567
Plan: Standard Flow

Time: 1/6/2026, 1:30:00 AM
```

## Troubleshooting

### SMS Not Received

1. **Check Vercel Logs**:
   - Go to Vercel → Deployments → Click on latest deployment
   - Click "Functions" tab
   - Look for `/api/send-sms` logs

2. **Verify Environment Variables**:
   - Ensure all Twilio credentials are correctly set
   - Phone numbers should be in E.164 format: `+19804216801`

3. **Check Twilio Console**:
   - Go to Twilio Console → Monitor → Logs → Messaging
   - Look for recent message attempts and any errors

4. **Trial Account Limitations**:
   - Twilio trial accounts can only send SMS to verified phone numbers
   - Verify 9804216801 in Twilio Console → Phone Numbers → Verified Caller IDs

### Build Errors

If you encounter build errors after deployment:

1. Check that all dependencies are installed:
   ```bash
   npm install
   ```

2. Verify the build succeeds locally:
   ```bash
   npm run build
   ```

## Cost Information

- **Twilio Trial**: $15 free credit (~500 SMS messages)
- **After Trial**: ~$0.0075 per SMS in the US
- **Monthly Cost Estimate**: 
  - 10 bookings/month = $0.075
  - 50 bookings/month = $0.375
  - 100 bookings/month = $0.75

## Security Notes

- ⚠️ **Never commit** `.env.local` to Git (already in `.gitignore`)
- ⚠️ **Keep Auth Token secret** - it provides full access to your Twilio account
- ✅ Environment variables are securely stored in Vercel
- ✅ API endpoint validates all requests before sending SMS

## Files Modified

- `api/send-sms.ts` - Vercel serverless function for Twilio integration
- `components/BookingForm.tsx` - User information collection form
- `components/Hero.tsx` - "Book With Me" button integration
- `components/PricingSection.tsx` - Plan selection integration
- `services/notificationService.ts` - SMS notification functions
- `.env.example` - Environment variable template

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Check Twilio Console logs
3. Review browser console for errors
4. Verify environment variables are set correctly
