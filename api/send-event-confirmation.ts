import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

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
        const { contactInfo, eventTitle, eventDate, eventTime, userName } = req.body;

        // Validate required fields
        if (!contactInfo || !eventTitle || !eventDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Determine if contactInfo is email or phone
        const isEmail = contactInfo.includes('@');
        const isPhone = /^\+?[\d\s\-\(\)]+$/.test(contactInfo);

        let confirmationSent = false;
        let method = '';

        // Send SMS if it's a phone number
        if (isPhone) {
            try {
                const client = Twilio(accountSid, authToken);

                // Format the confirmation message
                const message = `✅ RESERVATION CONFIRMED\n\n${userName || 'Guest'}, you're all set for:\n\n📅 ${eventTitle}\n🗓️ ${new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}\n⏰ ${eventTime}\n\nSee you there! 💪\n\n- PettyFitness 22`;

                // Ensure phone number is in E.164 format
                let phoneNumber = contactInfo.replace(/[\s\-\(\)]/g, '');
                if (!phoneNumber.startsWith('+')) {
                    phoneNumber = '+1' + phoneNumber; // Assume US number if no country code
                }

                await client.messages.create({
                    body: message,
                    from: fromNumber,
                    to: phoneNumber
                });

                confirmationSent = true;
                method = 'SMS';
                console.log('SMS confirmation sent to:', phoneNumber);
            } catch (smsError: any) {
                console.error('SMS sending failed:', smsError);
                // Continue to try email if SMS fails
            }
        }

        // If email or SMS failed, note that email would be sent here
        if (isEmail && !confirmationSent) {
            // In a real implementation, you would send an email here
            // For now, we'll just log it
            console.log('Email confirmation would be sent to:', contactInfo);
            confirmationSent = true;
            method = 'Email (simulated)';
        }

        if (confirmationSent) {
            return res.status(200).json({
                success: true,
                method: method,
                message: `Confirmation sent via ${method}`
            });
        } else {
            return res.status(200).json({
                success: false,
                message: 'Could not send confirmation - invalid contact info'
            });
        }

    } catch (error: any) {
        console.error('Error sending confirmation:', error);
        return res.status(500).json({
            error: 'Failed to send confirmation',
            details: error.message
        });
    }
}
