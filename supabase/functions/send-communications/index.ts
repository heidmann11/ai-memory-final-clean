// Setup Deno & Supabase types
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import sgMail from 'https://esm.sh/@sendgrid/mail'
import Twilio from 'https://esm.sh/twilio'

// Initialize Supabase with your Service Role key
const supabase = createClient(
  Deno.env.get('SUPA_URL')!,
  Deno.env.get('SUPA_KEY')!
)

// Init SendGrid & Twilio
sgMail.setApiKey(Deno.env.get('SENDGRID_KEY')!)
const twClient = Twilio(
  Deno.env.get('TWILIO_SID')!,
  Deno.env.get('TWILIO_TOKEN')!
)

serve(async () => {
  // 1) Find all pending touches whose time has arrived
  const { data: comms = [] } = await supabase
    .from('communications')
    .select('id, bid_id, channel, attempt')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())

  for (const c of comms) {
    // 2) Look up the bid’s contact info
    const { data: [bid] } = await supabase
      .from('bids')
      .select('client_email, client_phone')
      .eq('id', c.bid_id)
      .limit(1)

    try {
      // 3a) Send email
      if (c.channel === 'email' && bid?.client_email) {
        await sgMail.send({
          to: bid.client_email,
          from: 'noreply@routeandretain.ai',
          subject: 'Quick follow‑up on your request',
          text: `Hi—just touching base on your bid request (${c.bid_id}). Let me know if you have any questions!`,
        })

      // 3b) Or send SMS
      } else if (c.channel === 'sms' && bid?.client_phone) {
        await twClient.messages.create({
          to: bid.client_phone,
          from: Deno.env.get('TWILIO_FROM')!,
          body: `Thanks for your request (${c.bid_id})—we’ll be in touch soon!`,
        })

      } else {
        throw new Error('No contact info for bid ' + c.bid_id)
      }

      // 4) Mark as sent
      await supabase
        .from('communications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', c.id)

    } catch (err) {
      // On failure, bump attempt count and record the error
      await supabase
        .from('communications')
        .update({
          status: 'failed',
          attempt: c.attempt + 1,
          error_message: String(err),
        })
        .eq('id', c.id)
    }
  }

  return new Response('OK')
})
