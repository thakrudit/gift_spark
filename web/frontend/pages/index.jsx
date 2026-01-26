import { Layout } from "@shopify/polaris";
import { Toggle } from "../components";

export default function HomePage() {
  return (
    <Layout>
      <Layout.Section>
        <Toggle />
      </Layout.Section>
      <Layout.Section secondary></Layout.Section>
    </Layout>
  );
}
