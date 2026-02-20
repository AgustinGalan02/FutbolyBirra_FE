import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input, Button, List } from '../components/index';
import { getArgentineTeams } from '../api/footballTeams';
import { useAuth } from "../context/AuthContext.jsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../../src/schemas/authSchema";
import '../index.css';


function RegisterPage() {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
        reValidateMode: "onChange"
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
        const loadTeams = async () => {
            const data = await getArgentineTeams();
            const argentina = {
                team: { id: 26, name: "Seleccion Argentina (NEUTRAL)", logo: "https://media.api-sports.io/football/teams/26.png" }
            };
            setTeams([argentina, ...data]);
            setLoading(false);
        };
        loadTeams();
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
        <div className="bg-background-image flex items-center justify-center min-h-screen">
            <div className="bg-zinc-800/90 backdrop-blur-4x1 max-w-md p-10 rounded-4xl w-full shadow-2xl border-zinc-700">

                <h1 className="text-2xl font-bold text-white mb-6 text-center">Crear Cuenta</h1>

                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <Input
                        placeholder="Usuario"
                        {...register("username")}
                        error={errors.username?.message || registerErrors.find(err => err.field === "username")?.message}

                    />

                    <Input
                        placeholder="Email"
                        {...register("email")}
                        error={errors.email?.message || registerErrors.find(err => err.field === "email")?.message} />

                    <Input
                        placeholder="Contraseña"
                        type="password"
                        {...register("password")}
                        error={errors.password?.message || registerErrors.find(e => e.field === "password")?.message}
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-zinc-400 text-sm ml-1">Seleccioná tu equipo</label>
                        <div className="h-48 overflow-y-auto border border-zinc-700 rounded-md p-1 bg-zinc-900/50">
                            <List
                                items={teams}
                                isLoading={loading}
                                renderItem={(item) => (
                                    <div
                                        key={item.team.id}
                                        onClick={() => handleSelectTeam(item.team)}
                                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all ${selectedTeam === item.team.id ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'
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

                <p className="flex gap-x-2 mt-6 text-zinc-400 text-sm px-1 justify-start">
                    ¿Ya tenés una cuenta?
                    <Link to="/login" className="text-blue-500 hover:underline font-semibold">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;