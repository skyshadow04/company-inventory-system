import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function LoginPage(){
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>
                        Login
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Input placeholder="Email"/>
                        <Input type="password" placeholder="Password"/>
                        <Button className="w-full">
                            Login
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}