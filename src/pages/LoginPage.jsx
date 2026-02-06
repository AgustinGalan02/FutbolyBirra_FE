import { useForm } from 'react-hook-form';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("Datos enviados:", data);
    };

    return (
        <div className='bg-zinc-800 max-w-md p-10 rounded-md'>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                <Button type="submit">
                    Entrar
                </Button>
            </form>
        </div>
    );
}

export default LoginPage;