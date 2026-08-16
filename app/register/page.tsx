"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function RegisterPage(){

    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");


    async function register(){

    const res = await fetch(
        "/api/auth/register",
        {
            method:"POST",
            headers:{
            "Content-Type":"application/json"
        },
            body:JSON.stringify({
            name,
            email,
            password,
            role:"user"
        })
        }
    );

    const data = await res.json();

    if(res.ok){
        alert("Account created");
        window.location.href="/login";
    }else{
        alert(data.message);
    }
}

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>
                        Create Account
                    </CardTitle>
                </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
                    <Input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                    <Input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                    <Button className="w-full" onClick={register}>
                        Register
                    </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}