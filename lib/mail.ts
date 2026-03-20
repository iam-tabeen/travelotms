import { Resend } from 'resend';

// Initialize the Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBackupEmail(toEmail: string, csvContent: string, fileName: string) {
    try {
        // Convert the raw CSV string into a Base64 encoded buffer for the email attachment
        const base64Content = Buffer.from(csvContent).toString('base64');

        const { data, error } = await resend.emails.send({
            // Note: Until you verify your own domain in Resend, you must use this exact "from" address 
            // and you can only send emails to the address you used to sign up for Resend.
            from: 'Travelo Vault <onboarding@resend.dev>', 
            to: toEmail,
            subject: `📦 Your Automated Database Backup - ${new Date().toLocaleDateString()}`,
            html: `
                <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #003580;">Data Backup Successful</h2>
                    <p>Hello,</p>
                    <p>Attached is your secure database snapshot (<strong>${fileName}</strong>).</p>
                    <p>This includes all your latest Regular Leads, Custom Tour requests, and Booking data. Please keep this file safe!</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888;">Automated by your Premium Travelo TMS Subscription.</p>
                </div>
            `,
            attachments: [
                {
                    filename: fileName,
                    content: base64Content,
                }
            ]
        });

        if (error) throw new Error(error.message);
        return { success: true, data };

    } catch (error: any) {
        console.error("Failed to send backup email:", error);
        return { success: false, error: error.message };
    }
}