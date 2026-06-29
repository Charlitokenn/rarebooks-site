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
import {AppConfig} from "../../constants";

interface TrialLicenseEmailProps {
    firstName?: string;
    lastName?: string;
    licenseKey?: string;
    expiryDate?: string;
    storeUrl?: string;
    isLocal? : boolean;
}

export default function TrialLicenseEmail({
                                              firstName = "there",
                                              licenseKey = "XXXX-XXXX-XXXX-XXXX",
                                              expiryDate = "14 days from today",
                                              storeUrl = "https://apps.microsoft.com",
                                              isLocal = false
                                          }: TrialLicenseEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your RareBooks Trial License Key is ready</Preview>
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
                                Hello,
                            </Text>
                            <Text className="text-base text-zinc-700 mt-3">
                                New enquiry has been received
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
                                                Enquiry Details
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
                                                            Full Name
                                                        </Text>
                                                    </td>
                                                    <td style={{ paddingBottom: "12px" }}>
                                                        <Text
                                                            className="m-0 text-sm font-bold text-zinc-900"
                                                            style={{ letterSpacing: "0.05em" }}
                                                        >
                                                            {firstName}
                                                        </Text>
                                                    </td>
                                                </tr>

                                                {/* Trial duration row */}
                                                <tr>
                                                    <td
                                                        style={{
                                                            width: "38%",
                                                            paddingBottom: "12px",
                                                            verticalAlign: "top",
                                                        }}
                                                    >
                                                        <Text className="m-0 text-sm font-medium text-zinc-500">
                                                            Trial Period
                                                        </Text>
                                                    </td>
                                                    <td style={{ paddingBottom: "12px" }}>
                                                        <Text className="m-0 text-sm font-bold text-zinc-900">
                                                            {isLocal ? `${AppConfig.trial.localDuration}`: `${AppConfig.trial.abroadDuration}` } days
                                                        </Text>
                                                    </td>
                                                </tr>

                                                {/* Expiry row */}
                                                <tr>
                                                    <td style={{ width: "38%", verticalAlign: "top" }}>
                                                        <Text className="m-0 text-sm font-medium text-zinc-500">
                                                            Expires On
                                                        </Text>
                                                    </td>
                                                    <td>
                                                        <Text className="m-0 text-sm font-bold text-zinc-900">
                                                            {expiryDate}
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
                                To get started:
                            </Text>
                            <Text className="text-sm text-zinc-600 mt-2 mb-0">
                                1. Download {AppConfig.appName} from the Microsoft Store using the button
                                below.
                            </Text>
                            <Text className="text-sm text-zinc-600 mt-1 mb-0">
                                2. Open the app and enter your license key when prompted.
                            </Text>
                            <Text className="text-sm text-zinc-600 mt-1 mb-0">
                                3. If you've opted for the "Done for You plan", reply to this email with your business data in excel/pdf/png format so we can start digitizing your data.
                            </Text>
                            <Text className="text-sm text-zinc-600 mt-1 mb-0">
                                4. If you opted for the "Do it Yourself plan", our documentation to setup and use the app can be found <a href={AppConfig.documentationUrl} target="_blank" rel="noopener noreferrer">here</a>.
                            </Text>
                        </Section>

                        {/* CTA button */}
                        <Section className="mt-6">
                            <table
                                style={{
                                    border: "1px solid rgb(39 39 42 / 0.2)",
                                    borderRadius: "8px",
                                    borderCollapse: "separate",
                                    width: "fit-content",
                                }}
                            >
                                <tr>
                                    <td>
                                        <Button
                                            className="flex items-center justify-center rounded-[8px] bg-zinc-900 px-[24px] py-[12px] text-[14px] font-semibold text-white"
                                            href={storeUrl}
                                        >
                                            Download from Store →
                                        </Button>
                                    </td>
                                </tr>
                            </table>
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