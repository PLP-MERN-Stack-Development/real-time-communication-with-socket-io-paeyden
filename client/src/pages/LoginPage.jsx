import React, { useState } from "react";
import { loginUser } from "../services/api";
import { useSocket } from "../socket/socket";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const LoginPage = ({ onLogin }) => {
  const { connect } = useSocket();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const { data } = await loginUser({ email, password });

      // Save token immediately
      localStorage.setItem("token", data.token);

      // Connect socket with user object + token
      connect(data.user, data.token);

      toast("Login successful!", {
        description: `Welcome back, ${data.user.username}`,
      });

      // ✅ Pass both user and token to App
      onLogin({ user: data.user, token: data.token });
    } catch (err) {
      toast("Login failed", {
        description: err.response?.data?.message || "Please try again.",
      });
    }
  };

  return (
    <Card className="p-6 w-96 space-y-4">
      <h2 className="text-xl font-semibold">Login</h2>
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
      <Button className="w-full bg-primary/50" onClick={handleLogin}>
        Sign In
      </Button>
    </Card>
  );
};

export default LoginPage;