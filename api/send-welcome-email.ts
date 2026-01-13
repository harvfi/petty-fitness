import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
        const { userName, userEmail } = req.body;

        // Validate required fields
        if (!userName || !userEmail) {
            return res.status(400).json({ error: 'Missing required fields: userName and userEmail' });
        }

        // Create welcome email content
        const subject = '🏋️ Welcome to PettyFitness 22!';
        const htmlContent = `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 48px; font-weight: bold; font-style: italic; letter-spacing: -2px; margin: 0;">
              PETTYFITNESS<span style="color: #d4ff00;">22</span>
            </h1>
            <p style="color: #d4ff00; font-size: 12px; font-weight: bold; letter-spacing: 3px; margin-top: 10px;">ELITE PERFORMANCE MANAGEMENT</p>
          </div>

          <!-- Welcome Message -->
          <div style="background: linear-gradient(135deg, rgba(212, 255, 0, 0.1) 0%, transparent 100%); border: 1px solid rgba(212, 255, 0, 0.3); border-radius: 24px; padding: 30px; margin-bottom: 30px;">
            <h2 style="color: #d4ff00; font-size: 32px; font-weight: bold; font-style: italic; margin: 0 0 20px 0;">
              Welcome, ${userName}!
            </h2>
            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0;">
              Thank you for joining the PettyFitness 22 family! We're excited to help you achieve your fitness goals and transform your life.
            </p>
          </div>

          <!-- What's Next Section -->
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 24px; padding: 30px; margin-bottom: 30px;">
            <h3 style="color: #fff; font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 20px 0;">
              What's Next?
            </h3>
            <div style="margin-bottom: 20px;">
              <div style="display: flex; align-items: start; margin-bottom: 15px;">
                <div style="background: rgba(212, 255, 0, 0.2); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                  <span style="color: #d4ff00; font-weight: bold;">1</span>
                </div>
                <div>
                  <p style="color: #fff; font-weight: bold; margin: 0 0 5px 0;">Log Into Your Dashboard</p>
                  <p style="color: #a1a1aa; font-size: 14px; margin: 0;">Access your personalized training portal to track workouts, nutrition, and progress.</p>
                </div>
              </div>
              <div style="display: flex; align-items: start; margin-bottom: 15px;">
                <div style="background: rgba(212, 255, 0, 0.2); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                  <span style="color: #d4ff00; font-weight: bold;">2</span>
                </div>
                <div>
                  <p style="color: #fff; font-weight: bold; margin: 0 0 5px 0;">Connect With Your Coach</p>
                  <p style="color: #a1a1aa; font-size: 14px; margin: 0;">Your trainer will reach out soon to schedule your first session and discuss your goals.</p>
                </div>
              </div>
              <div style="display: flex; align-items: start;">
                <div style="background: rgba(212, 255, 0, 0.2); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                  <span style="color: #d4ff00; font-weight: bold;">3</span>
                </div>
                <div>
                  <p style="color: #fff; font-weight: bold; margin: 0 0 5px 0;">Start Your Journey</p>
                  <p style="color: #a1a1aa; font-size: 14px; margin: 0;">Begin logging workouts, tracking nutrition, and crushing your fitness goals!</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quote Section -->
          <div style="text-align: center; padding: 30px 0; border-top: 1px solid #27272a; border-bottom: 1px solid #27272a; margin-bottom: 30px;">
            <p style="color: #d4ff00; font-size: 24px; font-style: italic; font-weight: bold; margin: 0 0 10px 0;">
              "Hard work is easy work"
            </p>
            <p style="color: #71717a; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0;">
              — PettyFitness 22 Philosophy
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center;">
            <p style="color: #71717a; font-size: 12px; margin: 0 0 10px 0;">
              Questions? Reply to this email or contact us at <a href="mailto:${process.env.TRAINER_EMAIL || 'Patpat8526@yahoo.com'}" style="color: #d4ff00; text-decoration: none;">${process.env.TRAINER_EMAIL || 'Patpat8526@yahoo.com'}</a>
            </p>
            <p style="color: #52525b; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">
              © 2024 PettyFitness 22. All Rights Reserved.
            </p>
          </div>
        </div>
      `;

        // Send welcome email to user
        const data = await resend.emails.send({
            from: 'PettyFitness 22 <onboarding@resend.dev>',
            to: [userEmail],
            subject: subject,
            html: htmlContent,
        });

        console.log('Welcome email sent successfully:', data.id);

        return res.status(200).json({
            success: true,
            emailId: data.id,
            message: 'Welcome email sent successfully'
        });

    } catch (error: any) {
        console.error('Error sending welcome email:', error);
        return res.status(500).json({
            error: 'Failed to send welcome email',
            details: error.message
        });
    }
}
