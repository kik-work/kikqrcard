import Head from "next/head";
import { Inter, Manrope, Noto_Sans, Roboto } from "next/font/google";
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Dashboard body font (see .dashboard in globals.css). Exposed on :root below so portals can use it too.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false, // only fetched when a page actually renders with it (the dashboard)
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-noto-sans",
  display: "swap",
  preload: false, // fallback face for glyphs Manrope lacks; never block first paint on it
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  display: "swap",
  preload: false,
});

function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
        }
      `}</style>
      <div className={`${manrope.variable} ${notoSans.variable} ${roboto.variable}`}>
        <TooltipProvider>
          <Component {...pageProps} />
          <Toaster />
        </TooltipProvider>
      </div>
    </SessionProvider>
  );
}
export default App;
