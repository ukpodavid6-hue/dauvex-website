import { Resend } from 'resend';

const recipient = 'davidaukpong@gmail.com';
const testingSender = 'Dauvex Website <onboarding@resend.dev>';
const sender = process.env.RESEND_FROM_EMAIL || testingSender;
const allowedServices = new Set([
  'Website',
  'Software or app',
  'Automation',
  'Digital support',
  'Not sure yet',
]);

const textValue = (value) => (typeof value === 'string' ? value.trim() : '');

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const body = request.body || {};
  const name = textValue(body.name);
  const email = textValue(body.email);
  const company = textValue(body.company);
  const service = textValue(body.service);
  const project = textValue(body.project);

  const errors = {};
  if (!name || name.length > 120) errors.name = 'Please enter your name.';
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) errors.email = 'Please enter a valid email address.';
  if (company.length > 160) errors.company = 'Company name is too long.';
  if (!allowedServices.has(service)) errors.service = 'Please select a service.';
  if (!project || project.length > 5000) errors.project = 'Please tell us about the project.';

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({ error: 'Please check the highlighted fields.', fields: errors });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured.');
    return response.status(500).json({ error: 'Email service is not configured yet.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: sender,
    to: [recipient],
    replyTo: email,
    subject: `New Dauvex enquiry from ${name}`,
    text: [
      `Name: ${name}`,
      `Work email: ${email}`,
      `Company: ${company || 'Not provided'}`,
      `Requested service: ${service}`,
      '',
      'Project details:',
      project,
    ].join('\n'),
  });

  if (error) {
    console.error('Resend error:', error);
    return response.status(502).json({ error: 'We could not send your enquiry. Please try again.' });
  }

  return response.status(200).json({ success: true });
}