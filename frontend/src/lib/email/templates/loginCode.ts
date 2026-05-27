interface LoginCodeProps {
  otp: string;
  email: string;
  expiresMinutes?: number;
}

export function buildLoginCodeHtml({ otp, email, expiresMinutes = 5 }: LoginCodeProps): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding-bottom:24px;">
          <h1 style="margin:0;font-size:24px;font-weight:700;color:#18181b;letter-spacing:-0.02em;">
            Login Now
          </h1>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;">
          <p style="margin:0;font-size:15px;color:#52525b;line-height:24px;">
            Enter your email to receive a one-time login code.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-size:14px;color:#71717a;line-height:20px;">
            We've sent a 6-digit login code to <strong style="color:#18181b;">${email}</strong>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fafafa;border:1px solid #e4e4e7;border-radius:8px;">
            <tr>
              <td align="center" style="padding:24px 16px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;">
                  One-time code
                </p>
                <p style="margin:0;font-size:36px;font-weight:700;color:#e71333;letter-spacing:0.25em;font-family:'Courier New',Courier,monospace;">
                  ${otp}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:8px;">
          <p style="margin:0;font-size:13px;color:#71717a;line-height:18px;">
            This code expires in ${expiresMinutes} minutes.
          </p>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin:0;font-size:13px;color:#71717a;line-height:18px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  `;
}
