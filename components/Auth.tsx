'use client'
import { Input, Button } from "@nextui-org/react";
import { setCookie } from 'cookies-next'


function Auth() {
    const handlePasswordSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const password = event.target.password.value;
        setCookie('password', password);
      };

  return <form onSubmit={handlePasswordSubmit} className="flex w-[400px] flex-col items-center justify-center h-screen mx-auto">
  <Input
    label="Password"
    name="password"
    className="mb-4"
  />
  <Button type="submit" color="primary">Submit</Button>
    </form>
}

export default Auth;