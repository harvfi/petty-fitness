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
        const { userName, userEmail, userPhone, planTitle, bookingDate, action } = req.body;

        // Validate required fields
        if (!userName || !action) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create email content based on action type
        let subject = '';
        let htmlContent = '';

        if (action === 'plan_selection') {
            subject = `🏋️ New Plan Selected - ${planTitle}`;
            htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff8c37;">🏋️ NEW PLAN SELECTED</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Client:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail || 'Not provided'}</p>
            <p><strong>Phone:</strong> ${userPhone || 'Not provided'}</p>
            <p><strong>Plan:</strong> ${planTitle}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
          </div>
          <p style="color: #666; font-size: 12px;">PettyFitness 22 - Notification System</p>
        </div>
      `;
        } else if (action === 'booking') {
            const dateInfo = bookingDate
                ? `<p><strong>Preferred Date:</strong> ${new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>`
                : '';

            subject = '📅 New Booking Request';
            htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff8c37;">📅 NEW BOOKING REQUEST</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Client:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail || 'Not provided'}</p>
            <p><strong>Phone:</strong> ${userPhone || 'Not provided'}</p>
            ${dateInfo}
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
          </div>
          <p style="color: #666; font-size: 12px;">PettyFitness 22 - Notification System</p>
        </div>
      `;
        } else {
            return res.status(400).json({ error: 'Invalid action type' });
        }

        // Send email to trainer
        const data = await resend.emails.send({
            from: 'PettyFitness 22 <notifications@pettyfitness22.com>',
            to: [trainerEmail],
            subject: subject,
            html: htmlContent,
        });

        console.log('Email sent successfully:', data.id);

        return res.status(200).json({
            success: true,
            emailId: data.id,
            message: 'Email notification sent successfully'
        });

    } catch (error: any) {
        console.error('Error sending email:', error);
        return res.status(500).json({
            error: 'Failed to send email notification',
            details: error.message
        });
    }
}
