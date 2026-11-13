import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Yumna AI Studio",
  description: "Neobrutalism AI Chat Studio with Gemini & DALL-E",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${spaceGrotesk.className} antialiased`}>{children}</body>
    </html>
  );
}
