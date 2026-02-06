import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Input, Button, List } from '../components/index';
import { getArgentineTeams } from '../api/footballTeams';
import '../index.css';
import { RegisterRequest } from "../api/auth";


function RegisterPage() {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);

    const onSubmit = handleSubmit(async (values) => {
        console.log(values);
        const response = await RegisterRequest(values);
        console.log(response);
    });

    useEffect(() => {
        const loadTeams = async () => {
            const data = await getArgentineTeams();

            const argentina = {
                team: {
                    id: 26,
                    name: "Seleccion Argentina (NEUTRAL)",
                    logo: "https://media.api-sports.io/football/teams/26.png"
                }
            };

            setTeams([argentina, ...data]);
            setLoading(false);
        };
        loadTeams();
    }, []);

    const handleSelectTeam = (team) => {
        setSelectedTeam(team.id);
        setValue("team", team.id);
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-zinc-800 max-w-md p-10 rounded-md w-full shadow-xl">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Crear Cuenta</h1>

                <form onSubmit={onSubmit} className="flex flex-col gap-4">

                    <Input
                        placeholder="Usuario"
                        {...register("username", { required: "El nombre de usuario es obligatorio" })}
                        error={errors.username?.message}
                    />

                    <Input
                        placeholder="Email"
                        {...register("email", { required: "El email es obligatorio" })}
                        error={errors.email?.message}
                    />

                    <Input
                        placeholder="Contraseña"
                        type="password"
                        {...register("password", { required: "La contraseña es obligatoria" })}
                        error={errors.password?.message}
                    />

                    {/* --- LISTA DE EQUIPOS --- */}
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
                                        className={`
                                            flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all
                                            ${selectedTeam === item.team.id
                                                ? 'bg-blue-600 text-white'
                                                : 'text-zinc-300 hover:bg-zinc-700'}
                                        `}
                                    >
                                        <img src={item.team.logo} alt="escudo" className="w-6 h-6 object-contain" />
                                        <span className="text-sm">{item.team.name}</span>
                                    </div>
                                )}
                            />
                        </div>
                        {/* Hidden input para que hookform valide el equipo */}
                        <input type="hidden" {...register("team", { required: "Elegí un equipo" })} />
                        {errors.teamId && <span className="text-red-500 text-xs ml-1">{errors.teamId.message}</span>}
                    </div>

                    <Button type="submit">
                        Registrarse
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;