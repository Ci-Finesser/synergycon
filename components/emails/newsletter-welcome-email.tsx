import { Html, Head, Body, Container, Section, Img, Heading, Text, Button, Link } from "@react-email/components"
import type { NewsletterWelcomeEmailProps } from '@/types/components'

// Re-export for backward compatibility
export type { NewsletterWelcomeEmailProps }

export function NewsletterWelcomeEmail({ headerText, bodyHtml, footerText, logoUrl }: NewsletterWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            {logoUrl && <Img src={logoUrl} alt="Finesser Logo" style={logo} />}
            <Heading style={headerHeading}>{headerText}</Heading>
          </Section>

          <Section style={content}>
            <Text style={bodyText}>{bodyHtml ? bodyHtml.replace(/<[^>]*>/g, "") : ''}</Text>
            <Button href="https://synergycon.live" style={cta}>
              Secure Your Spot Now
            </Button>
          </Section>

          <Section style={footer}>
            <Text style={footerTextStyle}>{footerText}</Text>
            <Text style={footerLinks}>
              <Link href="https://finesser.co" style={link}>
                Visit Finesser
              </Link>
              {" · "}
              <Link href="https://synergycon.live" style={link}>
                SynergyCon Website
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default NewsletterWelcomeEmail

const main = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  lineHeight: "1.6",
  color: "#E5E5E5",
  backgroundColor: "#0A0A0A",
}

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#0A0A0A",
}

const header = {
  textAlign: "center" as const,
  padding: "40px 20px",
  background: "#0A0A0A",
  borderBottom: "1px solid #262626",
}

const logo = {
  maxWidth: "150px",
  marginBottom: "20px",
}

const headerHeading = {
  color: "#FAFAFA",
  fontSize: "28px",
  margin: "0",
  fontWeight: "700",
}

const content = {
  padding: "40px",
  background: "#0F0F0F",
  borderLeft: "1px solid #262626",
  borderRight: "1px solid #262626",
}

const bodyText = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#D4D4D4",
}

const cta = {
  display: "inline-block",
  padding: "14px 32px",
  background: "#FAFAFA",
  color: "#0A0A0A",
  textDecoration: "none",
  borderRadius: "12px",
  fontWeight: "600",
  marginTop: "24px",
}

const footer = {
  textAlign: "center" as const,
  padding: "30px 20px",
  background: "#0A0A0A",
  borderRadius: "0 0 12px 12px",
  border: "1px solid #262626",
  borderTop: "none",
}

const footerTextStyle = {
  margin: "0",
  fontSize: "14px",
  color: "#737373",
}

const footerLinks = {
  marginTop: "12px",
  fontSize: "12px",
  color: "#737373",
}

const link = {
  color: "#A3A3A3",
  textDecoration: "none",
}
