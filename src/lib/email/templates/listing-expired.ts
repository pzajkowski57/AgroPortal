export interface ListingExpiredEmailParams {
  listingTitle: string
  listingUrl: string
  userName: string
}

export interface EmailContent {
  subject: string
  html: string
}

export function buildListingExpiredEmail(params: ListingExpiredEmailParams): EmailContent {
  const { listingTitle, listingUrl, userName } = params

  const subject = 'Twoje ogłoszenie wygasło — przedłuż je'

  const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#16a34a;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">AgroPortal</h1>
              <p style="margin:4px 0 0;color:#bbf7d0;font-size:14px;">Ogłoszenia rolnicze</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#374151;">Cześć <strong>${escapeHtml(userName)}</strong>,</p>

              <p style="margin:0 0 16px;font-size:16px;color:#374151;">
                Twoje ogłoszenie <strong>&ldquo;${escapeHtml(listingTitle)}&rdquo;</strong> wygasło i nie jest już widoczne dla innych użytkowników.
              </p>

              <p style="margin:0 0 24px;font-size:16px;color:#374151;">
                Możesz je przedłużyć w dowolnym momencie, klikając przycisk poniżej.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#16a34a;border-radius:6px;">
                    <a href="${escapeHtml(listingUrl)}"
                       style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;">
                      Przedłuż ogłoszenie
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#6b7280;">
                Jeśli nie chcesz przedłużać ogłoszenia, możesz je zignorować — zostanie ono usunięte po pewnym czasie.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                © ${new Date().getFullYear()} AgroPortal. Wszelkie prawa zastrzeżone.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  return { subject, html }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
