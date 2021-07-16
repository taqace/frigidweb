import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from "argon2";


@InputType()
class UsernamePasswordInput{
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse{
    @Field(() => [FieldError],{nullable:true})
    errors?: FieldError[];

    @Field(() => User,{nullable:true})
    user?: User;
}

@Resolver()
export class UserResolver{
    @Query(() => User, {nullable: true})
    async me(
        @Ctx() { req, em }: MyContext
    ) {
        if (!req.session.userID) {
            return null
        }

        const user = await em.findOne(User, {id: req.session.userID});
        return user
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse>{
        if (options.username.length <= 2){
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Length must be greater than two',
                    },
                ],
            };
        }

        if (options.password.length <= 3) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Length must be greater than three',
                    },
                ],
            };
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User,{
            username: options.username,
            password: hashedPassword,
        });
        try{
            await em.persistAndFlush(user)
        } catch (err) {
            // || err.detail.includes("already exists")){
            // duplicate username error code i think?
            if (err.code === "23505") {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username already taken",
                        },
                    ],
                };
            }
        }
        
        req.session.userID = user.id;  //logs in user after registering

        return {user};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em,req}: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User,{username: options.username});
        if (!user) {
            return{
                errors: [
                    {
                    field: "username",
                    message: "That username doesn't exist"
                    }
                ],
            };
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return{
                errors: [
                    {
                    field: "password",
                    message: "Incorrect Password"
                    }
                ],
            };
            
        }

        req.session!.userID = user.id;
        
        return {user,};
    }
}