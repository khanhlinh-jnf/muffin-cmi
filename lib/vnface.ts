export async function vnfaceFetch(path: string) {
  const fullUrl = process.env.VNFACE_BASE_URL + path;
  console.log("VNFACE FETCH:", fullUrl);

  const res = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VNFACE_ACCESS_TOKEN}`,
      "Token-Channel": process.env.VNFACE_TOKEN_CHANNEL!,
    },
  });

  console.log("VNFACE STATUS:", res.status);

  if (!res.ok) {
    const err = await res.text();
    console.error("VNFACE ERROR:", err);
    throw new Error(err);
  }

  return res.json();
}
