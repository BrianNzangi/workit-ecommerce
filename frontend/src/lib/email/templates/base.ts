interface BaseEmailProps {
  previewText?: string;
  children: string;
}

export function buildBaseHtml({ previewText, children }: BaseEmailProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  ${previewText ? `<!--[if !mso]><!-- --><meta name="x-apple-disable-message-reformatting" /><!--<![endif]-->
  <span style="display:none;font-size:0;line-height:0;color:transparent;max-height:0;overflow:hidden;mso-hide:all;">${previewText}</span>` : ''}
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;">
          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://workit.co.ke/logo.png" alt="Workit" width="120" height="auto" style="display:block;border:0;outline:none;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:8px;padding:40px 32px;text-align:left;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
              ${children}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size:12px;color:#a1a1aa;line-height:18px;">
                    <p style="margin:0 0 4px;">Workit Online Kenya</p>
                    <p style="margin:0 0 4px;">Dubai, UAE</p>
                    <p style="margin:0;">&copy; ${new Date().getFullYear()} Workit. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
