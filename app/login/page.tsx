import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Sign in · Orbis Live Ad Studio" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return <LoginForm next={safeNext} />;
}
