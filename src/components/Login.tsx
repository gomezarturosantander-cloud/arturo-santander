import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Layout } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded login as requested for personal use
    if (username === 'Arturo' && password === '1524348576') {
      onLogin();
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-black rounded-2xl">
              <Layout className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">WebDesign Manager</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para gestionar tu negocio
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input 
                id="username" 
                placeholder="Arturo" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-black hover:bg-neutral-800 text-white py-6 rounded-xl">
              Iniciar Sesión
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
