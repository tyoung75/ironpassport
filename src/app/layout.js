import "./globals.css";

export const metadata = {
  title: "Iron Passport – Find the Best Gyms for Travelers",
  description: "Find day passes, scores, and reviews for the best gyms worldwide. Iron Passport helps traveling lifters find top gyms in any city.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
