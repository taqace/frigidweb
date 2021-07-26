import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
    if (!options.email.includes('@')) {
        return [
                {
                    field: "email",
                    message: "invalid email",
                },
        ]
        
    }
    if (options.username.length <= 2) {
        return [
                {
                    field: "username",
                    message: "Length must be greater than two",
                },
        ]
        
    }

    if (options.password.length <= 3) {
        return [
                {
                    field: "password",
                    message: "Length must be greater than three",
                },
        ]
        
    }

    if (options.username.includes('@')) {
        return [
                {
                    field: "username",
                    message: "cannot include @ symbol",
                },
        ]
    
    }
    return null;
}