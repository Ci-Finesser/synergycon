export interface EmailTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail?: string
  htmlContent: string
  variables: string[]
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome-newsletter",
    name: "Welcome Newsletter",
    description: "Welcome new subscribers to your newsletter",
    category: "Newsletter",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A;">
        <h1 style="color: #FAFAFA; font-size: 28px; margin-bottom: 20px; padding: 40px 40px 0;">Welcome, {{first_name}}! 🎉</h1>
        <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6; margin-bottom: 20px; padding: 0 40px;">
          Thank you for subscribing to our newsletter. We're thrilled to have you as part of our community!
        </p>
        <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6; margin-bottom: 20px; padding: 0 40px;">
          You'll receive regular updates about:
        </p>
        <ul style="color: #A3A3A3; font-size: 16px; line-height: 1.8; margin-bottom: 30px; padding: 0 40px 0 60px;">
          <li>Upcoming events and announcements</li>
          <li>Exclusive content and resources</li>
          <li>Industry insights and trends</li>
          <li>Special offers and opportunities</li>
        </ul>
        <div style="text-align: center; margin: 40px 0; padding: 0 40px;">
          <a href="#" style="background-color: #FAFAFA; color: #0A0A0A; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Get Started
          </a>
        </div>
        <p style="color: #737373; font-size: 14px; margin-top: 40px; padding: 0 40px 40px; border-top: 1px solid #262626; padding-top: 30px;">
          Questions? Feel free to reach out to us anytime.
        </p>
      </div>
    `,
    variables: ["first_name"],
  },
  {
    id: "event-invitation",
    name: "Event Invitation",
    description: "Invite subscribers to an upcoming event",
    category: "Event",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A;">
        <div style="background-color: #171717; padding: 40px; text-align: center; border-bottom: 1px solid #262626;">
          <h1 style="color: #FAFAFA; font-size: 32px; margin: 0;">You're Invited!</h1>
        </div>
        <div style="padding: 40px; background-color: #0F0F0F;">
          <p style="color: #FAFAFA; font-size: 18px; margin-bottom: 20px;">
            Hi {{first_name}},
          </p>
          <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We're excited to invite you to our upcoming event. Join us for an unforgettable experience!
          </p>
          <div style="background-color: #171717; padding: 30px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #FAFAFA;">
            <h2 style="color: #FAFAFA; font-size: 24px; margin-top: 0;">Event Details</h2>
            <p style="color: #D4D4D4; font-size: 16px; margin: 10px 0;"><strong style="color: #FAFAFA;">Date:</strong> [Event Date]</p>
            <p style="color: #D4D4D4; font-size: 16px; margin: 10px 0;"><strong style="color: #FAFAFA;">Time:</strong> [Event Time]</p>
            <p style="color: #D4D4D4; font-size: 16px; margin: 10px 0;"><strong style="color: #FAFAFA;">Location:</strong> [Event Location]</p>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="background-color: #FAFAFA; color: #0A0A0A; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Register Now
            </a>
          </div>
          <p style="color: #737373; font-size: 14px; text-align: center;">
            We look forward to seeing you there!
          </p>
        </div>
      </div>
    `,
    variables: ["first_name"],
  },
  {
    id: "promotional-announcement",
    name: "Promotional Announcement",
    description: "Announce special offers or promotions",
    category: "Promotion",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A;">
        <div style="background-color: #171717; padding: 30px; text-align: center; border-bottom: 1px solid #262626;">
          <h1 style="color: #FAFAFA; font-size: 36px; margin: 0;">Special Offer! 🎁</h1>
          <p style="color: #A3A3A3; font-size: 18px; margin: 10px 0;">Limited Time Only</p>
        </div>
        <div style="padding: 40px; background-color: #0F0F0F;">
          <p style="color: #FAFAFA; font-size: 18px; margin-bottom: 20px;">
            Hi {{first_name}},
          </p>
          <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            We have an exclusive offer just for you! Don't miss out on this incredible opportunity.
          </p>
          <div style="background-color: #171717; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0; border: 1px solid #262626;">
            <h2 style="color: #FAFAFA; font-size: 48px; margin: 0;">Save 40%</h2>
            <p style="color: #A3A3A3; font-size: 20px; margin: 10px 0;">Use code: SAVE40</p>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="background-color: #FAFAFA; color: #0A0A0A; padding: 18px 50px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
              Claim Your Offer
            </a>
          </div>
          <p style="color: #737373; font-size: 14px; text-align: center; margin-top: 40px;">
            *Offer expires soon. Terms and conditions apply.
          </p>
        </div>
      </div>
    `,
    variables: ["first_name"],
  },
  {
    id: "newsletter-update",
    name: "Newsletter Update",
    description: "Regular newsletter with updates and news",
    category: "Newsletter",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A;">
        <div style="background-color: #171717; padding: 30px; text-align: center; border-bottom: 1px solid #262626;">
          <h1 style="color: #FAFAFA; font-size: 28px; margin: 0;">Newsletter</h1>
          <p style="color: #A3A3A3; font-size: 16px; margin: 10px 0;">Latest Updates & News</p>
        </div>
        <div style="padding: 40px; background-color: #0F0F0F;">
          <p style="color: #FAFAFA; font-size: 16px; margin-bottom: 20px;">
            Hello {{first_name}},
          </p>
          <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Here's what's new this month:
          </p>
          
          <div style="margin: 30px 0; padding-bottom: 30px; border-bottom: 1px solid #262626;">
            <h2 style="color: #FAFAFA; font-size: 22px; margin-bottom: 15px;">📢 Feature Update</h2>
            <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6;">
              We've just launched exciting new features to improve your experience. Check them out today!
            </p>
          </div>
          
          <div style="margin: 30px 0; padding-bottom: 30px; border-bottom: 1px solid #262626;">
            <h2 style="color: #FAFAFA; font-size: 22px; margin-bottom: 15px;">🎯 Tips & Tricks</h2>
            <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6;">
              Learn how to get the most out of our platform with these helpful tips and best practices.
            </p>
          </div>
          
          <div style="margin: 30px 0;">
            <h2 style="color: #FAFAFA; font-size: 22px; margin-bottom: 15px;">🌟 Community Spotlight</h2>
            <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6;">
              See how our community members are achieving amazing results. Get inspired!
            </p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="background-color: #FAFAFA; color: #0A0A0A; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Read More
            </a>
          </div>
        </div>
      </div>
    `,
    variables: ["first_name"],
  },
  {
    id: "thank-you",
    name: "Thank You",
    description: "Express gratitude to your subscribers",
    category: "General",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A;">
        <div style="text-align: center; padding: 60px 40px;">
          <div style="font-size: 80px; margin-bottom: 20px;">🙏</div>
          <h1 style="color: #FAFAFA; font-size: 36px; margin-bottom: 20px;">Thank You!</h1>
          <p style="color: #D4D4D4; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
            Hi {{first_name}}, we wanted to take a moment to express our sincere gratitude.
          </p>
        </div>
        <div style="background-color: #171717; padding: 40px; border-radius: 8px; margin: 20px; border: 1px solid #262626;">
          <p style="color: #D4D4D4; font-size: 16px; line-height: 1.8; text-align: center; margin: 0;">
            Your support means the world to us. We're committed to providing you with the best experience possible, and we couldn't do it without amazing people like you.
          </p>
        </div>
        <div style="text-align: center; padding: 40px;">
          <p style="color: #737373; font-size: 14px; line-height: 1.6;">
            We're always here if you need anything. Don't hesitate to reach out!
          </p>
        </div>
      </div>
    `,
    variables: ["first_name"],
  },
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Announce a new product or service",
    category: "Announcement",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A;">
        <div style="background-color: #171717; padding: 50px 40px; text-align: center; border-bottom: 1px solid #262626;">
          <h1 style="color: #FAFAFA; font-size: 40px; margin: 0 0 10px 0;">Introducing</h1>
          <h2 style="color: #A3A3A3; font-size: 32px; margin: 0; font-weight: 300;">Something New</h2>
        </div>
        <div style="padding: 40px; background-color: #0F0F0F;">
          <p style="color: #FAFAFA; font-size: 18px; margin-bottom: 20px;">
            Hi {{first_name}},
          </p>
          <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            We're thrilled to announce the launch of our latest product! This is something we've been working on for months, and we can't wait to share it with you.
          </p>
          <div style="background-color: #171717; padding: 30px; border-radius: 8px; margin: 30px 0; border: 1px solid #262626;">
            <h3 style="color: #FAFAFA; font-size: 24px; margin-top: 0;">What's New?</h3>
            <ul style="color: #D4D4D4; font-size: 16px; line-height: 1.8; padding-left: 20px;">
              <li>Innovative features designed for your needs</li>
              <li>Enhanced performance and reliability</li>
              <li>Beautiful, intuitive interface</li>
              <li>Seamless integration with your workflow</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="background-color: #FAFAFA; color: #0A0A0A; padding: 18px 50px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
              Explore Now
            </a>
          </div>
          <p style="color: #737373; font-size: 14px; text-align: center;">
            Be one of the first to experience the future!
          </p>
        </div>
      </div>
    `,
    variables: ["first_name"],
  },
  {
    id: "survey-feedback",
    name: "Survey & Feedback",
    description: "Request feedback or survey responses",
    category: "Engagement",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A;">
        <div style="padding: 40px; text-align: center;">
          <div style="font-size: 60px; margin-bottom: 20px;">💭</div>
          <h1 style="color: #FAFAFA; font-size: 32px; margin-bottom: 15px;">We'd Love Your Feedback</h1>
          <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6;">
            Help us serve you better, {{first_name}}
          </p>
        </div>
        <div style="background-color: #171717; padding: 40px; margin: 20px; border-radius: 8px; border: 1px solid #262626;">
          <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your opinion matters! We're constantly working to improve our service, and your feedback helps us understand what we're doing right and where we can do better.
          </p>
          <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            This quick survey will only take 2-3 minutes of your time.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #FAFAFA; color: #0A0A0A; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Take Survey
            </a>
          </div>
          <p style="color: #737373; font-size: 14px; text-align: center; margin-top: 30px;">
            As a thank you, you'll be entered to win a special prize! 🎁
          </p>
        </div>
      </div>
    `,
    variables: ["first_name"],
  },
  {
    id: "blank-canvas",
    name: "Blank Canvas",
    description: "Start with a clean slate",
    category: "General",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #0A0A0A;">
        <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6;">
          Start writing your email content here...
        </p>
      </div>
    `,
    variables: [],
  },
]

export const templateCategories = [
  "All",
  "Newsletter",
  "Event",
  "Promotion",
  "Announcement",
  "Engagement",
  "General",
]
