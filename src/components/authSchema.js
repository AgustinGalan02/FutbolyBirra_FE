import { z } from 'zod'

export const registerSchema = z.object({
    username: z.string({
        required_error: 'Ingresar usuario'
    })
        .min(3, {
            message: 'El usuario debe tener al menos 3 caracteres'
        })
        .max(20, {
            message: 'El usuario no puede tener más de 20 caracteres'
        })
        .regex(/^[a-zA-Z0-9_]+$/, {
            message: 'El usuario solo puede contener letras, números y guiones bajos (sin espacios)'
        }),
    email: z.string({
        required_error: 'Ingresar email'
    })
        .email({
            message: 'Ingresar un email válido'
        })
        .toLowerCase(),
    password: z.string({
        required_error: 'Ingresar contraseña'
    })
        .min(6, {
            message: 'La contraseña debe tener al menos 6 caracteres'
        })
        .max(50, {
            message: 'La contraseña no puede tener más de 50 caracteres'
        }),
    team: z.string({
        required_error: "Tenés que elegir un equipo"
    })
        .min(1, "Tenés que elegir un equipo"),
    role: z.string().optional()
})

export const loginSchema = z.object({
    email: z.string({
        required_error: 'Ingresar email'
    })
        .email({
            message: 'Ingresar un email válido'
        })
        .toLowerCase(),
    password: z.string({
        required_error: 'Ingresar contraseña'
    })
        .min(6, {
            message: 'La contraseña debe tener al menos 6 caracteres'
        })
})