import { Body, Container, Head, Html, Preview, Section, Tailwind, Text } from "react-email";
import { AppConfig } from "../../constants";

interface SiteFailedEmailProps {
  firstName?: string;
}

/** Sent when a site couldn't be set up (spec 0014 AC-6). It never names the reason. */
export default function SiteFailedEmail({ firstName = "there" }: SiteFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>We're on it: your RareBooks site</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto px-4 py-5 max-w-[580px]">
            <Section className="mt-4">
              <Text className="text-base text-zinc-700 m-0">Hello {firstName},</Text>
              <Text className="text-base text-zinc-700 mt-3">
                We hit a problem setting up your {AppConfig.appName} site. We have been alerted and are on
                it, and we will email you as soon as it is ready.
              </Text>
              <Text className="text-base text-zinc-700 mt-3">
                There is nothing you need to do. If you have a question, write to{" "}
                {AppConfig.emails.supportEmail}.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
