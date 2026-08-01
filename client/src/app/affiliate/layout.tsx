import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Dashboard | Alween Luxury Perfumes",
  description: "Join the Alween partner program and earn store credit when friends shop through your link. Enjoy lifetime commissions on all their future purchases.",
  openGraph: {
    title: "Affiliate Dashboard | Alween Luxury Perfumes",
    description: "Join the Alween partner program and earn store credit on referrals.",
    url: "https://alween.com/affiliate",
  }
};

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
