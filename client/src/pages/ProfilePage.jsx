import React, { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../services/api";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const ProfilePage = ({ user, onUpdate }) => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getUserProfile();
        setProfile(data);
      } catch (err) {
        toast("Failed to load profile", {
          description: err.response?.data?.message || "Please try again.",
        });
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const { data } = await updateUserProfile(profile);
      toast("Profile updated!", { description: "Your changes were saved." });
      onUpdate(data); // update parent state if needed
    } catch (err) {
      toast("Update failed", {
        description: err.response?.data?.message || "Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="p-6 w-96 space-y-4">
        <h2 className="text-xl font-semibold">My Profile</h2>
        <Input
          name="username"
          value={profile.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <Input
          name="email"
          type="email"
          value={profile.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <Button className="w-full" onClick={handleSave}>
          Save Changes
        </Button>
      </Card>
    </div>
  );
};

export default ProfilePage;