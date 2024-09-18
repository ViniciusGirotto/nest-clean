import { ConflictException } from "@nestjs/common";
import { Body, Controller, Post } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { hash } from "bcryptjs";

@Controller('/accounts')
export class CreateAccountController {

    constructor(private prisma: PrismaService){} 

    @Post()
    async handle(@Body() body: {name: string, email: string, password: string}){
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