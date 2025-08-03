'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';


export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
             setError('Пароль должен быть не менее 6 символов.');
             return;
        }
        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await signup(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Этот email уже зарегистрирован.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Некорректный формат email.');
            }
            else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Регистрация</h1>
                <p className="text-balance text-muted-foreground">
                    Введите ваши данные для создания аккаунта
                </p>
            </div>
            <form onSubmit={handleSignup} className="grid gap-4">
                 {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Ошибка регистрации</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                    <Input 
                        id="confirm-password" 
                        type="password" 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Создать аккаунт"}
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Уже есть аккаунт?{' '}
                <Link href="/login" className="underline">
                    Войти
                </Link>
            </div>
        </>
    );
}