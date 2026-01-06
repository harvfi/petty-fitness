import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const toNumber = process.env.TRAINER_PHONE_NUMBER || '9804216801';

export default async function handler(req: any, res: any) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate environment variables
    if (!accountSid || !authToken || !fromNumber) {
        console.error('Missing Twilio credentials');
        return res.status(500).json({
            error: 'SMS service not configured',
            details: 'Missing Twilio credentials'
        });
    }

    try {
        const { userName, userEmail, userPhone, planTitle, bookingDate, action } = req.body;

        // Validate required fields
        if (!userName || !action) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create SMS message based on action type
        let message = '';
        if (action === 'plan_selection') {
            message = `🏋️ NEW PLAN SELECTED\n\nClient: ${userName}\nEmail: ${userEmail || 'Not provided'}\nPhone: ${userPhone || 'Not provided'}\nPlan: ${planTitle}\n\nTime: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`;
        } else if (action === 'booking') {
            const dateInfo = bookingDate ? `\nPreferred Date: ${new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}` : '';
            message = `📅 NEW BOOKING REQUEST\n\nClient: ${userName}\nEmail: ${userEmail || 'Not provided'}\nPhone: ${userPhone || 'Not provided'}${dateInfo}\n\nTime: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`;
        } else {
            return res.status(400).json({ error: 'Invalid action type' });
        }

        // Initialize Twilio client
        const client = Twilio(accountSid, authToken);

        // Send SMS
        const twilioMessage = await client.messages.create({
            body: message,
            from: fromNumber,
            to: toNumber
        });

        console.log('SMS sent successfully:', twilioMessage.sid);

        return res.status(200).json({
            success: true,
            messageSid: twilioMessage.sid,
            message: 'SMS notification sent successfully'
        });

    } catch (error: any) {
        console.error('Error sending SMS:', error);
        return res.status(500).json({
            error: 'Failed to send SMS notification',
            details: error.message
        });
    }
}
