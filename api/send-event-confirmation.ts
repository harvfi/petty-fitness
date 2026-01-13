import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const trainerEmail = process.env.TRAINER_EMAIL || 'Patpat8526@yahoo.com';

export default async function handler(req: any, res: any) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate environment variables
    if (!process.env.RESEND_API_KEY) {
        console.error('Missing Resend API key');
        return res.status(500).json({
            error: 'Email service not configured',
            details: 'Missing RESEND_API_KEY'
        });
    }

    try {
        const { contactInfo, eventTitle, eventDate, eventTime, userName } = req.body;

        // Validate required fields
        if (!contactInfo || !eventTitle || !eventDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const formattedDate = new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        // Determine if contactInfo is email or phone
        const isEmail = contactInfo.includes('@');

        let confirmationSent = false;
        let method = '';

        // Send confirmation email to user if they provided an email
        if (isEmail) {
            try {
                await resend.emails.send({
                    from: 'PettyFitness 22 <onboarding@resend.dev>',
                    to: [contactInfo],
                    subject: `✅ Reservation Confirmed - ${eventTitle}`,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff8c37;">✅ RESERVATION CONFIRMED</h2>
              <p>Hi ${userName || 'there'},</p>
              <p>You're all set for:</p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📅 Event:</strong> ${eventTitle}</p>
                <p><strong>🗓️ Date:</strong> ${formattedDate}</p>
                <p><strong>⏰ Time:</strong> ${eventTime}</p>
              </div>
              <p>See you there! 💪</p>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">- PettyFitness 22</p>
            </div>
          `,
                });

                confirmationSent = true;
                method = 'Email';
                console.log('Email confirmation sent to user:', contactInfo);
            } catch (emailError: any) {
                console.error('Email sending to user failed:', emailError);
            }
        }

        // ALWAYS send notification to trainer
        try {
            await resend.emails.send({
                from: 'PettyFitness 22 <onboarding@resend.dev>',
                to: [trainerEmail],
                subject: `📅 New Event RSVP - ${eventTitle}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff8c37;">📅 NEW EVENT RSVP</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Client:</strong> ${userName || 'Guest'}</p>
              <p><strong>Contact:</strong> ${contactInfo}</p>
              <p><strong>Event:</strong> ${eventTitle}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${eventTime}</p>
              <p><strong>Booked:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
            </div>
            <p style="color: #666; font-size: 12px;">PettyFitness 22 - Notification System</p>
          </div>
        `,
            });

            console.log('Trainer notification sent to:', trainerEmail);
        } catch (trainerError: any) {
            console.error('Failed to send trainer notification:', trainerError);
            // Don't fail the request if trainer notification fails
        }

        if (confirmationSent || !isEmail) {
            return res.status(200).json({
                success: true,
                method: method || 'Notification sent to trainer',
                message: confirmationSent ? `Confirmation sent via ${method}` : 'Reservation confirmed'
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
