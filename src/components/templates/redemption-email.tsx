import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";
import { AppConfig } from "../../constants";

interface TrialLicenseEmailProps {
  firstName?: string;
  licenseKey?: string;
}

export default function RedemptionEmail({
  firstName = "there",
  licenseKey = "ABC123XYZ"
}: TrialLicenseEmailProps) {

  return (
    <Html>
      <Head />
      <Preview>{AppConfig.appName} lifetime subscription</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto px-4 py-5 max-w-[580px]">
            {/*/!* Logo / Brand *!/*/}
            {/*<Section className="mt-8">*/}
            {/*    <Link href={storeUrl}>*/}
            {/*        <Text className="m-0 text-2xl font-bold text-zinc-900 tracking-tight">*/}
            {/*            {AppConfig.appName}*/}
            {/*        </Text>*/}
            {/*    </Link>*/}
            {/*</Section>*/}

            {/*/!* Headline *!/*/}
            {/*<Section className="mt-8">*/}
            {/*    <Text className="text-xl font-bold leading-tight text-zinc-900 m-0">*/}
            {/*        Your Trial License Key 🎉*/}
            {/*    </Text>*/}
            {/*</Section>*/}

            {/* Greeting + intro */}
            <Section className="mt-4">
              <Text className="text-base text-zinc-700 m-0">
                Hey {firstName},
              </Text>
              <Text className="text-base text-zinc-700 mt-3">
                Thank you for redeeming your lifetime subscription license. The following are your license key details
              </Text>
            </Section>

            {/* License key card */}
            <Section className="mt-6">
              <div
                style={{
                  border: "1px solid rgb(39 39 42 / 0.2)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {/* Card header */}
                    <tr>
                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid rgb(39 39 42 / 0.15)",
                          backgroundColor: "rgb(39 39 42 / 0.05)",
                        }}
                      >
                        <Text className="m-0 text-sm font-semibold text-zinc-700">
                          Lifetime license key
                        </Text>
                      </td>
                    </tr>

                    {/* Card body */}
                    <tr>
                      <td style={{ padding: "16px" }}>
                        <table style={{ width: "100%" }}>
                          <tbody>
                            {/* License key row */}
                            <tr>
                              <td
                                style={{
                                  width: "38%",
                                  paddingBottom: "12px",
                                  verticalAlign: "top",
                                }}
                              >
                                <Text className="m-0 text-sm font-medium text-zinc-500">
                                  License key:
                                </Text>
                              </td>
                              <td style={{ paddingBottom: "12px" }}>
                                <Text
                                  className="m-0 text-sm font-bold text-zinc-900"
                                  style={{ letterSpacing: "0.05em" }}
                                >
                                  {licenseKey}
                                </Text>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Instructions */}
            <Section className="mt-6">
              <Text className="text-base text-zinc-700 m-0">
                What's next:
              </Text>
              <Text className="text-sm text-zinc-600 mt-2 mb-0">
                1. Visit the
                  <a
                    href={AppConfig.urls.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    microsoft store
                  </a> to download the desktop app
              </Text>
              <Text className="text-sm text-zinc-600 mt-1 mb-0">
                2. To manage your device activations, visit the companion
                <a
                  href={AppConfig.urls.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  client portal
                </a>
              </Text>
              <Text className="text-sm text-zinc-600 mt-1 mb-0">
                3. Our official documentations can be found from <a
                    href={AppConfig.urls.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  here
                </a>
              </Text>
            </Section>

            <Hr className="mb-6 mt-8 border-zinc-200" />

            {/* Footer */}
            <Section className="text-left text-sm text-zinc-500">
              <Text className="m-0 p-0 font-medium">From,</Text>
              <Text className="m-0 p-0 font-bold text-zinc-700">
                Charles | RareBooks
              </Text>
              <Text className="m-0 p-0 mt-1">
                Questions? Reply to this email and we'll get back to you.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

//How to use
// import TrialLicenseEmail from "./emails/TrialLicenseEmail";
// import { render } from "@react-email/render";
//
// const html = render(
//     <TrialLicenseEmail
//         firstName={firstName}
//         licenseKey={licenseKey}
//         expiryDate={expiryDate}
//         storeUrl="https://apps.microsoft.com/your-app-link"
//     />
// );
//
// await resend.emails.send({
//     from: "Charles | RareBooks <noreply@yourdomain.com>",
//     to: email,
//     subject: "Your Trial License Key",
//     text: `Hello ${firstName},\n\nYour 14-day trial license key is: ${licenseKey}\n\nDownload the app here: ${storeUrl}\n\nBest regards,\nThe Team`,
//     html,
// });
