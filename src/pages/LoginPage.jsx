import { useForm } from 'react-hook-form';
import { Input, Button, Footer } from '../components/';
import { useEffect } from 'react';
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onSubmit",
    });

    const { signin, isAuthenticated, errors: signinErrors } = useAuth();

    const navigate = useNavigate();

    const onSubmit = handleSubmit((data) => {
        signin(data);
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/profile");
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen bg-background-image flex flex-col font-sans">
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="bg-zinc-800/90 backdrop-blur-4xl max-w-md p-10 rounded-4xl w-full shadow-2xl border border-zinc-700 animate-in fade-in zoom-in duration-300">
                    <img
                        src="/logo1.png"
                        alt="Futbol y Birra Logo"
                        className="w-48 h-48 object-contain drop-shadow-md mx-auto mb-1"
                    />
                    <h1 className="text-2xl font-bold text-white mb-4 text-center">INICIAR SESIÓN</h1>

                    <form onSubmit={onSubmit} className="flex flex-col gap-4">
                        <Input
                            placeholder="Email"
                            type="email"
                            {...register("email")}
                            error={signinErrors.find(err => err.field === "email")?.message}
                        />

                        <Input
                            placeholder="Contraseña"
                            type="password"
                            {...register("password")}
                            error={signinErrors.find(err => err.field === "password")?.message}
                        />

                        <Button type="submit">
                            Entrar
                        </Button>
                    </form>

                    <p className="flex gap-x-2 mt-6 text-zinc-400 text-sm justify-center">
                        ¿No tenés cuenta?
                        <Link to="/register" className="text-blue-500 hover:underline font-semibold">
                            Registrate
                        </Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}


export default LoginPage;
