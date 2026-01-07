# Email Notifications Setup Guide

## Overview
The PettyFitness 22 application now uses **email notifications** instead of SMS. This is easier to set up and completely free!

## Email Service: Resend

We're using [Resend](https://resend.com) - a modern email API that's:
- ✅ **Free tier**: 3,000 emails/month for free
- ✅ **Easy setup**: Get API key in 2 minutes
- ✅ **Reliable**: Built for developers
- ✅ **No credit card required** for free tier

## Setup Instructions

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Click "Start Building" or "Sign Up"
3. Sign up with your email or GitHub account
4. Verify your email address

### Step 2: Get Your API Key
1. After logging in, go to **API Keys** in the dashboard
2. Click "Create API Key"
3. Give it a name like "PettyFitness 22"
4. Select **Full Access** permission
5. Click "Add"
6. **Copy the API key** (starts with `re_`)
   - ⚠️ Save it now - you won't see it again!

### Step 3: Verify Your Domain (Optional but Recommended)
For production use, verify your domain:
1. Go to **Domains** in Resend dashboard
2. Click "Add Domain"
3. Enter your domain (e.g., `pettyfitness22.com`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually 5-10 minutes)

**For testing**, you can skip this and use Resend's test domain.

### Step 4: Add Environment Variables to Vercel
1. Go to your Vercel project: https://vercel.com/harvfis-projects/pettyfitness-22-ecosystem
2. Click **Settings** → **Environment Variables**
3. Add these variables:

   **Required:**
   - **Key**: `RESEND_API_KEY`
   - **Value**: Your Resend API key (e.g., `re_123abc...`)
   - **Environments**: Check all (Production, Preview, Development)

   **Optional:**
   - **Key**: `TRAINER_EMAIL`
   - **Value**: Your email address (e.g., `trainer@pettyfitness22.com`)
   - **Environments**: Check all
   - **Note**: Defaults to `trainer@pettyfitness22.com` if not set

4. Click **Save**

### Step 5: Redeploy
1. Go to **Deployments** tab in Vercel
2. Click the three dots (...) on the latest deployment
3. Select "Redeploy"
4. Wait for deployment to complete

## What Gets Emailed

### 1. Join Now / Book With Me
**Subject**: 📅 New Booking Request  
**Content**:
- Client name
- Email address
- Phone number (if provided)
- Preferred date
- Timestamp

### 2. Select Plan
**Subject**: 🏋️ New Plan Selected - [Plan Name]  
**Content**:
- Client name
- Email address
- Phone number (if provided)
- Selected plan
- Timestamp

### 3. Event RSVP
**Subject**: 📅 New Event RSVP  
**Content**:
- Client name
- Contact info
- Event name
- Event date and time
- Booking timestamp

## Testing

### Test Email Notifications
1. Visit your site: https://pettyfitness-22-ecosystem.vercel.app
2. Click "Join Now"
3. Fill out the form with test data
4. Submit
5. Check your email inbox for the notification!

## Troubleshooting

### Emails Not Arriving?
1. **Check spam folder** - Resend emails might go to spam initially
2. **Verify API key** - Make sure it's correct in Vercel
3. **Check Resend dashboard** - View email logs at https://resend.com/emails
4. **Verify environment variables** - Ensure `RESEND_API_KEY` is set
5. **Check browser console** - Look for error messages

### Email Goes to Spam?
- Verify your domain in Resend (Step 3 above)
- Add SPF and DKIM records
- Use a professional "from" address

## Cost

### Free Tier (Perfect for Starting)
- 3,000 emails/month
- 100 emails/day
- No credit card required

### Paid Plans (If You Need More)
- $20/month: 50,000 emails
- $80/month: 100,000 emails

## Support
- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Check email logs: https://resend.com/emails

## Migration from SMS
All SMS notifications have been replaced with email:
- ❌ Removed: Twilio SMS integration
- ✅ Added: Resend email integration
- ✅ Same triggers: Join Now, Book With Me, Select Plan, Event RSVP
- ✅ Better formatting: HTML emails with styling
- ✅ Free tier: No costs for normal usage

---

**Ready to go!** Once you add the `RESEND_API_KEY` to Vercel and redeploy, you'll start receiving email notifications for all user actions. 🎉
