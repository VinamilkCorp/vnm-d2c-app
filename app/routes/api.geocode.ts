import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
// import { getMyAppData } from "~/db/model.server";

const GG_GEOCODE_API_KEY = "AIzaSyBAc69ePFq58u3lKwwt2VoVSMU-_VuPY60";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { sessionToken, cors } = await authenticate.public.checkout(request, {
    corsHeaders: ["X-My-Custom-Header"],
  });

  const searchParams = new URL(request.url).searchParams;

  const address = searchParams?.get("address");

  if (!address) {
    return new Response("Not found", {
      status: 400,
    });
  }

  searchParams.append("key", GG_GEOCODE_API_KEY);

  const uri = `https://maps.googleapis.com/maps/api/geocode/json?${searchParams}`;

  try {
    const res = await fetch(uri, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-type": "text/plain",
      },
    });

    console.log("res", res.url);

    const data = await res.json();

    return cors(json(data));
  } catch (_) {
    return new Response("Server error", {
      status: 500,
    });
  }
};
