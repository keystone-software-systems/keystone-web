import type { FeedItemCandidate } from "./types";

const ENDPOINT = "https://api.producthunt.com/v2/api/graphql";

const QUERY = `
  query TopicPosts($topic: String!) {
    posts(topic: $topic, order: NEWEST, first: 20) {
      edges {
        node {
          id
          name
          tagline
          url
          website
          createdAt
        }
      }
    }
  }
`;

type PostNode = {
  id: string;
  name: string;
  tagline: string;
  url: string;
  website: string | null;
  createdAt: string;
};

/** Newest launches for a Product Hunt topic slug (e.g. "no-code", "artificial-intelligence"). */
export async function fetchProductHuntTopic(topic: string): Promise<FeedItemCandidate[]> {
  const token = process.env.PRODUCT_HUNT_API_TOKEN;
  if (!token) throw new Error("PRODUCT_HUNT_API_TOKEN is not set");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: QUERY, variables: { topic } }),
  });

  if (!res.ok) {
    throw new Error(`Product Hunt API error: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const edges: { node: PostNode }[] = json.data?.posts?.edges ?? [];

  return edges.map(({ node }) => ({
    externalId: node.id,
    title: node.name,
    url: node.website ?? node.url,
    snippet: node.tagline,
    raw: node,
  }));
}
