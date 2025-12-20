import "./globals.css";

export const metadata = {
  title: "Workout Tracker",
  description: "Built for gains. No excuses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}