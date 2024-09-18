import { ConflictException, UsePipes } from "@nestjs/common";
import { Body, Controller, Post } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { hash } from "bcryptjs";
import { z } from "zod";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";

const createAccountBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6)
})

type CreateAccountBody = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
export class CreateAccountController {
    constructor(private prisma: PrismaService){} 
    @Post()
    @UsePipes(new ZodValidationPipe(createAccountBodySchema))
    async handle(@Body() body: CreateAccountBody){
        const {name, email, password} = body

        const userWithEmailAlreadyExists = await this.prisma.user.findUnique({
            where: {
                email
            }
        })

        if(userWithEmailAlreadyExists){
            throw new ConflictException('User with this email already exists')
        }

        const hashedPassword = await hash(password, 8)

        await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })
    }
}