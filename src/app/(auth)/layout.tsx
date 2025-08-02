import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

const AuthLayoutContent = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard');
        }
    }, [user, loading, router]);

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
              {children}
            </div>
          </div>
          <div className="hidden bg-muted lg:block">
            <Image
              src="https://placehold.co/1920x1080.png"
              alt="Image"
              width="1920"
              height="1080"
              data-ai-hint="medical background"
              className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </div>
    )
}

export default function AuthLayout({ children }: { children: ReactNode }) {
    return <AuthLayoutContent>{children}</AuthLayoutContent>;
}