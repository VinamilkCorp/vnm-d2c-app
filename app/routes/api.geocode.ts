import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
// import { getMyAppData } from "~/db/model.server";

const GG_GEOCODE_API_KEY = "AIzaSyBAc69ePFq58u3lKwwt2VoVSMU-_VuPY60";

export const loader = async ({ request }: LoaderArgs) => {
  const { sessionToken, cors } = await authenticate.public.checkout(request, {
    corsHeaders: ["X-My-Custom-Header"],
  });

  const searchParams = new URL(request.url).searchParams;

  searchParams.append("key", GG_GEOCODE_API_KEY);

  // searchParams.append("result_type", "street_address");

  // searchParams.append("components", "country:VN");

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${searchParams}`,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-type": "application/json",
        },
      }
    );

    const data = await res.json();

    return cors(json(data));
  } catch (_) {
    return new Response("Server error", {
      status: 500,
    });
  }
};
