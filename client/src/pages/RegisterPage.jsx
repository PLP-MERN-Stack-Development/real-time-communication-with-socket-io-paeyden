import React, { useState } from "react";
import { registerUser } from "../services/api";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const RegisterPage = ({ onRegister }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const { data } = await registerUser({ username, email, password });
      toast("Registration successful!", { description: "You can now log in." });
      onRegister(data.user);
    } catch (err) {
      toast("Registration failed", {
        description: err.response?.data?.message || "Please try again.",
      });
    }
  };

  return (
    <Card className="p-6 w-96 space-y-4">
      <h2 className="text-xl font-semibold">Register</h2>
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <Button className="w-full" onClick={handleRegister}>
        Sign Up
      </Button>
    </Card>
  );
};

export default RegisterPage;