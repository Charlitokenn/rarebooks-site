import { Body, Button, Container, Head, Html, Preview, Section, Tailwind, Text } from "react-email";
import { AppConfig } from "../../constants";

interface SiteReadyEmailProps {
  firstName?: string;
  /** `/dashboard/site/open` on this site. Never the password link itself (spec 0014 AC-6). */
  openUrl: string;
}

export default function SiteReadyEmail({ firstName = "there", openUrl }: SiteReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your RareBooks site is ready</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto px-4 py-5 max-w-[580px]">
            <Section className="mt-4">
              <Text className="text-base text-zinc-700 m-0">Hello {firstName},</Text>
              <Text className="text-base text-zinc-700 mt-3">
                Your own {AppConfig.appName} site is ready, with your 30 day trial running. Open it to set
                your password and set up your company.
              </Text>
            </Section>
            <Section className="mt-6">
              <Button
                className="bg-zinc-900 text-white rounded-md px-5 py-3 text-sm font-semibold"
                href={openUrl}
              >
                Open my site
              </Button>
            </Section>
            <Section className="mt-6">
              <Text className="text-sm text-zinc-500 m-0">
                The button signs you in to your dashboard first, so only you can open it. Questions? Write
                to {AppConfig.emails.supportEmail}.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
