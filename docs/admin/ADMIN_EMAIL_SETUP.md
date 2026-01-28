# Email System Setup for SynergyCon

## Current Status
✅ Newsletter subscriptions are working and saving to database
✅ Email system is configured with Resend
⚠️ Emails currently only send to: bunmi.i.adewunmi@gmail.com (testing mode)

## To Enable Emails for All Subscribers

1. Go to https://resend.com/domains
2. Add and verify the domain: **synergycon.live**
3. Follow Resend's DNS verification steps
4. Once verified, update the "from" email in the code from:
   - `news@synergycon.live` 
   - to: `hello@synergycon.live` or `info@synergycon.live`

## What Works Now
- Users can subscribe and are saved to the database
- You can view all subscriptions in Supabase dashboard
- Success notifications show to users
- Welcome emails send to your admin email for testing

## After Domain Verification
- All subscribers will receive welcome emails automatically
- You can customize email templates from the admin panel
- Emails will come from your branded @synergycon.live address
