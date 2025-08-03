'use client';
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { AuthProvider } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const AuthLayoutContent = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (user) {
        return null; // или другой лоадер/пустой компонент, пока происходит редирект
    }


    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
              {children}
            </div>
          </div>
          <div className="hidden bg-muted lg:block">
            <Image
              src="/pharmacy.jpg"
              alt="Современная аптека с персоналом"
              width="1920"
              height="1080"
              data-ai-hint="modern pharmacy"
              className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </div>
    )
}

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <AuthLayoutContent>{children}</AuthLayoutContent>
        </AuthProvider>
    );
}
