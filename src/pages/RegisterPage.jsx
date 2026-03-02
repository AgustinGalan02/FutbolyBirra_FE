import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input, Button, List, Footer } from '../components/';
import { useAuth } from "../context/AuthContext.jsx";
import { ARGENTINE_TEAMS_LOCAL } from '../api/teamsData';
import '../index.css';

function RegisterPage() {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        mode: "onSubmit",
    });
    const { signup, isAuthenticated, errors: registerErrors } = useAuth();
    const navigate = useNavigate();

    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);

    // Si ya está autenticado, lo mandamos al home o perfil
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);



    useEffect(() => {
        setTeams(ARGENTINE_TEAMS_LOCAL);
        setLoading(false);
    }, []);

    const handleSelectTeam = (team) => {
        setSelectedTeam(team.id);
        setValue("team", String(team.id), // Lo guardamos como string para el backend
            {
                shouldValidate: true, // error desaparece al elegir equipo
                shouldDirty: true
            });
    };

    const onSubmit = handleSubmit(async (values) => {
        await signup(values);
    });

    return (
        /* 1. Contenedor principal flex-col */
        <div className="min-h-screen bg-background-image flex flex-col font-sans">

            {/* 2. Main que crece (flex-grow) y centra el contenido */}
            <main className="flex-grow flex items-center justify-center p-4 my-8">
                <div className="bg-zinc-800/90 backdrop-blur-4xl max-w-md p-10 rounded-4xl w-full shadow-2xl border border-zinc-700 animate-in fade-in zoom-in duration-300">
                    <img
                        src="/logo1.png"
                        alt="Futbol y Birra Logo"
                        className="w-40 h-40 object-contain drop-shadow-md mx-auto mb-1"
                    />
                    <h1 className="text-2xl font-bold text-white mb-4 text-center">CREAR CUENTA</h1>

                    <form onSubmit={onSubmit} className="flex flex-col gap-4">
                        <Input
                            placeholder="Usuario"
                            {...register("username", { required: "Ingresar usuario" })}
                            error={errors.username?.message || registerErrors.find(err => err.field === "username")?.message}
                        />

                        <Input
                            placeholder="Email"
                            {...register("email", { required: "Ingresar email" })}
                            error={errors.email?.message || registerErrors.find(err => err.field === "email")?.message}
                        />

                        <Input
                            placeholder="Contraseña"
                            type="password"
                            {...register("password", { required: "Ingresar contraseña" })}
                            error={errors.password?.message || registerErrors.find(e => e.field === "password")?.message}
                        />

                        <div className="flex flex-col gap-2">
                            <label className="text-zinc-400 text-sm ml-1">Seleccioná tu equipo</label>
                            <div className="h-48 overflow-y-auto border border-zinc-700 rounded-xl p-1 bg-zinc-900/50 custom-scrollbar">
                                <List
                                    items={teams}
                                    isLoading={loading}
                                    renderItem={(item) => (
                                        <div
                                            key={item.team.id}
                                            onClick={() => handleSelectTeam(item.team)}
                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${selectedTeam === item.team.id
                                                ? 'bg-[#f0ac00] text-black font-bold'
                                                : 'text-zinc-300 hover:bg-zinc-700'
                                                }`}
                                        >
                                            <img src={item.team.logo} alt="escudo" className="w-6 h-6 object-contain" />
                                            <span className="text-sm">{item.team.name}</span>
                                        </div>
                                    )}
                                />
                            </div>
                            <input type="hidden" {...register("team", { required: "Elegí un equipo" })} />
                            {errors.team && <span className="text-red-500 text-xs ml-1">{errors.team.message}</span>}
                        </div>

                        <Button type="submit">Registrarse</Button>
                    </form>

                    <p className="flex gap-x-2 mt-6 text-zinc-400 text-sm justify-center">
                        ¿Ya tenés una cuenta?
                        <Link to="/login" className="text-blue-500 hover:underline font-semibold">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default RegisterPage;
