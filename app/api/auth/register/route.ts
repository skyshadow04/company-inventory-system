import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";


export async function POST(req: Request) {

    try {

        const body = await req.json();

        const {
            name,
            email,
            password
        } = body;

        const safeRole = "staff";

        const existingUser = await prisma.user.findUnique({
            where:{
                email
            }
        });


        if(existingUser){

            return NextResponse.json(
                {
                    message:"User already exists"
                },
                {
                    status:400
                }
            );

        }


        const hashedPassword = await bcrypt.hash(
            password,
            12
        );


        const user = await prisma.user.create({

            data:{
                name,
                email,
                password:hashedPassword,
                role: safeRole
            }

        });


        return NextResponse.json({

            message:"User created successfully",
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role
            }

        });


    } catch (error: unknown) {

        const message = error instanceof Error ? error.message : "Unknown error";
        console.log(error);

        return NextResponse.json({
            message:"Registration failed",
            error: message
        },
        {
            status:500
        }
        );

    }

}