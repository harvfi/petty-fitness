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
        const {
            userName,
            userEmail,
            activityType,
            // Food fields
            foodName,
            calories,
            protein,
            carbs,
            fat,
            // Workout fields
            exercise,
            sets,
            reps,
            weight,
            volume
        } = req.body;

        // Validate required fields
        if (!userName || !activityType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create email content based on activity type
        let subject = '';
        let htmlContent = '';

        if (activityType === 'food') {
            subject = `🍽️ Food Logged - ${userName}`;
            htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff8c37;">🍽️ CLIENT FOOD LOG</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Client:</strong> ${userName}</p>
            ${userEmail ? `<p><strong>Email:</strong> ${userEmail}</p>` : ''}
            <p><strong>Food:</strong> ${foodName}</p>
            <p><strong>Calories:</strong> ${calories} kcal</p>
            <p><strong>Macros:</strong> Protein: ${protein}g | Carbs: ${carbs}g | Fat: ${fat}g</p>
            <p><strong>Logged:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
          </div>
          <p style="color: #666; font-size: 12px;">PettyFitness 22 - Activity Tracking System</p>
        </div>
      `;
        } else if (activityType === 'workout') {
            subject = `💪 Workout Logged - ${userName}`;
            htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff8c37;">💪 CLIENT WORKOUT LOG</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Client:</strong> ${userName}</p>
            ${userEmail ? `<p><strong>Email:</strong> ${userEmail}</p>` : ''}
            <p><strong>Exercise:</strong> ${exercise}</p>
            <p><strong>Sets:</strong> ${sets} | <strong>Reps:</strong> ${reps} | <strong>Weight:</strong> ${weight}kg</p>
            <p><strong>Total Volume:</strong> ${volume}kg</p>
            <p><strong>Logged:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
          </div>
          <p style="color: #666; font-size: 12px;">PettyFitness 22 - Activity Tracking System</p>
        </div>
      `;
        } else {
            return res.status(400).json({ error: 'Invalid activity type' });
        }

        // Send email to trainer
        const data = await resend.emails.send({
            from: 'PettyFitness 22 <onboarding@resend.dev>',
            to: [trainerEmail],
            subject: subject,
            html: htmlContent,
        });

        console.log('Activity notification email sent successfully:', data.id);

        return res.status(200).json({
            success: true,
            emailId: data.id,
            message: 'Activity notification sent successfully'
        });

    } catch (error: any) {
        console.error('Error sending activity notification:', error);
        return res.status(500).json({
            error: 'Failed to send activity notification',
            details: error.message
        });
    }
}
