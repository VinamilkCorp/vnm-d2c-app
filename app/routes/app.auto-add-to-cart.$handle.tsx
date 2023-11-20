import { defer } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Text, Card } from "@shopify/polaris";

type Props = {};

export const loader = async ({ params, request }) => {
  console.log("params.handle", params.handle);

  return defer({
    page: `AutoAddToCard ${params.handle}`,
  });
};

const CreateAutoAddToCard = (props: Props) => {
  const { page } = useLoaderData<typeof loader>();

  console.log("page", page);

  return (
    <Page
      backAction={{ content: "Auto add to cart", url: "/app/auto-add-to-cart" }}
      title="Auto add to cart"
      subtitle="Perfect for any pet"
      compactTitle
      primaryAction={{
        content: "Create rule",
        accessibilityLabel: "Primary action label",
        url: "/app/auto-add-to-cart/create",
      }}
    >
      <Card>
        <Text as="h2" variant="bodyMd">
          Content inside a card
        </Text>
        <p>Credit card information</p>
      </Card>
    </Page>
  );
};

export default CreateAutoAddToCard;
