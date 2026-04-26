import { groq } from "../config/ai.js";

const SYSTEM_PROMPT = `
Anda adalah Bookera AI, asisten virtual perpustakaan digital.

Tugas utama:
- Membantu pengguna mencari buku.
- Menjelaskan proses peminjaman.
- Menjelaskan denda keterlambatan.
- Memberikan rekomendasi buku.

Aturan:
- Selalu gunakan Bahasa Indonesia.
- Jawaban harus singkat, jelas, dan profesional.
- Fokus hanya pada layanan perpustakaan.
- Jika pertanyaan di luar konteks perpustakaan, tolak dengan sopan.
`;

export async function generateResponse(message: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return completion.choices[0].message.content ?? "";
}
