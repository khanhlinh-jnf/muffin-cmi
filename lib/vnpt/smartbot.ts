const SMARTBOT_ENDPOINT = process.env.SMARTBOT_ENDPOINT!
const SMARTBOT_API_KEY = process.env.SMARTBOT_API_KEY!

export async function askSmartBot(prompt: string): Promise<string> {
  const res = await fetch(SMARTBOT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': SMARTBOT_API_KEY,
    },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    console.error('SmartBot error', await res.text())
    throw new Error('SmartBot failed')
  }

  const data = await res.json() as any
  return data.answer ?? data.choices?.[0]?.message?.content ?? ''
}
