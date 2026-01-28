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
  color: "#333",
}

const container = {
  maxWidth: "600px",
  margin: "0 auto",
}

const header = {
  textAlign: "center" as const,
  padding: "40px 20px",
  background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)",
  borderRadius: "12px 12px 0 0",
}

const logo = {
  maxWidth: "150px",
  marginBottom: "20px",
}

const headerHeading = {
  color: "#fff",
  fontSize: "28px",
  margin: "0",
  fontWeight: "700",
}

const content = {
  padding: "40px",
  background: "#fff",
  borderLeft: "1px solid #e5e5e5",
  borderRight: "1px solid #e5e5e5",
}

const bodyText = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#333",
}

const cta = {
  display: "inline-block",
  padding: "14px 32px",
  background: "#0A0A0A",
  color: "#fff",
  textDecoration: "none",
  borderRadius: "12px",
  fontWeight: "600",
  marginTop: "24px",
}

const footer = {
  textAlign: "center" as const,
  padding: "30px 20px",
  background: "#f9f9f9",
  borderRadius: "0 0 12px 12px",
  border: "1px solid #e5e5e5",
  borderTop: "none",
}

const footerTextStyle = {
  margin: "0",
  fontSize: "14px",
  color: "#666",
}

const footerLinks = {
  marginTop: "12px",
  fontSize: "12px",
  color: "#666",
}

const link = {
  color: "#666",
  textDecoration: "none",
}
