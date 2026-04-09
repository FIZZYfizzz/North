import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Resend's shared testing address — works without domain verification.
// Replace with your own domain once verified (e.g. invites@yourdomain.com).
const FROM = 'North <onboarding@resend.dev>'

export async function sendInviteEmail({
  to,
  invitedBy,
  workspaceName,
  inviteUrl,
}: {
  to: string
  invitedBy: string
  workspaceName: string
  inviteUrl: string
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${invitedBy} invited you to ${workspaceName} on North`,
    html: buildInviteEmail({ invitedBy, workspaceName, inviteUrl }),
  })
}

function buildInviteEmail({
  invitedBy,
  workspaceName,
  inviteUrl,
}: {
  invitedBy: string
  workspaceName: string
  inviteUrl: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to ${workspaceName}</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #e8e8e6;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f0f0ee;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#7c6af7;border-radius:8px;font-size:14px;font-weight:700;color:#ffffff;">N</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#1a1a1a;line-height:1.3;">
                You're invited to join ${workspaceName}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#6b6b6b;line-height:1.6;">
                <strong style="color:#1a1a1a;">${invitedBy}</strong> has invited you to collaborate on <strong style="color:#1a1a1a;">${workspaceName}</strong> in North — calm, focused planning for teams.
              </p>
              <a href="${inviteUrl}"
                 style="display:inline-block;background:#7c6af7;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;">
                Accept invitation
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #f0f0ee;">
              <p style="margin:0;font-size:12px;color:#9b9b9b;line-height:1.5;">
                This invite expires in 7 days. If you weren't expecting this, you can ignore it.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#d4d4d2;">
                Or copy this link: <span style="color:#7c6af7;">${inviteUrl}</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
