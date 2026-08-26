import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: process.env.AWS_REGION || "eu-west-2" });

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Builds the full SES SendEmailCommand input for a contact form submission.
 *
 * @param {{ name: string, email: string, message: string }} payload
 * @returns {import("@aws-sdk/client-ses").SendEmailCommandInput}
 */
export function buildEmailParams(payload) {
  const { name, email, message } = payload;
  const timestamp = new Date().toISOString();

  return {
    Source: "noreply@thecodereflections.com",
    Destination: {
      ToAddresses: ["support@thecodereflections.com"],
    },
    ReplyToAddresses: [email],
    Message: {
      Subject: {
        Data: "New Contact Form Submission \u2013 SendSmiles",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: buildHtmlBody({ name, email, message, timestamp }),
          Charset: "UTF-8",
        },
        Text: {
          Data: buildTextBody({ name, email, message, timestamp }),
          Charset: "UTF-8",
        },
      },
    },
  };
}

/**
 * Builds the HTML email body with inline styles matching the site design language.
 */
function buildHtmlBody({ name, email, message, timestamp }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Form Submission</title>
</head>
<body style="margin:0;padding:0;background-color:#fdf8f2;font-family:Georgia,'Times New Roman',serif;color:#3a2a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf8f2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#700016;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                New Customer Enquiry
              </h1>
              <p style="margin:8px 0 0;color:#f5d0d8;font-size:13px;font-family:Arial,sans-serif;">
                SendSmiles &mdash; Contact Form Submission
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <!-- Name -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding-bottom:4px;">
                    <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#700016;">
                      Name
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#fdf8f2;border-left:3px solid #700016;padding:10px 14px;border-radius:0 4px 4px 0;">
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#3a2a1a;">
                      ${escapeHtml(name)}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Email -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding-bottom:4px;">
                    <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#700016;">
                      Email Address
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#fdf8f2;border-left:3px solid #700016;padding:10px 14px;border-radius:0 4px 4px 0;">
                    <a href="mailto:${escapeHtml(email)}" style="font-family:Arial,sans-serif;font-size:15px;color:#700016;text-decoration:underline;">
                      ${escapeHtml(email)}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding-bottom:4px;">
                    <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#700016;">
                      Message
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#fdf8f2;border-left:3px solid #700016;padding:16px 14px;border-radius:0 4px 4px 0;">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.7;color:#3a2a1a;white-space:pre-wrap;">
                      ${escapeHtml(message)}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Timestamp -->
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9a8070;text-align:right;">
                Submitted: ${escapeHtml(timestamp)}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f5ede3;padding:20px 40px;text-align:center;border-top:1px solid #e8d8c8;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9a8070;">
                Reply directly to this email to respond to the customer. This message was sent via the SendSmiles contact form.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Builds the plain-text fallback email body.
 */
function buildTextBody({ name, email, message, timestamp }) {
  return [
    "NEW CONTACT FORM SUBMISSION – SendSmiles",
    "=========================================",
    "",
    `Name:    ${name}`,
    `Email:   ${email}`,
    "",
    "Message:",
    "--------",
    message,
    "",
    "=========================================",
    `Submitted: ${timestamp}`,
    "",
    "Reply directly to this email to respond to the customer.",
    "This message was sent via the SendSmiles contact form.",
  ].join("\n");
}

/**
 * Escapes HTML special characters to prevent injection in the email body.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Lambda handler — parses body, validates fields, calls SES.
 *
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 * @returns {Promise<import("aws-lambda").APIGatewayProxyResult>}
 */
export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  let payload;

  // Parse request body
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON in request body." }),
    };
  }

  const { name, email, message } = payload;

  // Server-side validation — reject if any required field is missing or empty
  const missing = [];
  if (!name || String(name).trim().length === 0) missing.push("name");
  if (!email || String(email).trim().length === 0) missing.push("email");
  if (!message || String(message).trim().length === 0) missing.push("message");

  if (missing.length > 0) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: `Missing or empty required field(s): ${missing.join(", ")}.`,
      }),
    };
  }

  // Build and send the SES email
  try {
    const params = buildEmailParams({
      name: String(name).trim(),
      email: String(email).trim(),
      message: String(message).trim(),
    });

    const command = new SendEmailCommand(params);
    await sesClient.send(command);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("[sendContactEmail] SES send failed:", err);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Failed to send email. Please try again or contact us directly.",
      }),
    };
  }
};
