import { useState, useEffect, type FormEvent } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  addToast,
} from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { useAuthContext } from "@modules/user/context/AuthContext";

export default function UserAccount() {
  const { user, updateProfile, updatePassword, isLoading } = useAuthContext();

  // Profile state
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile({ name, email });
      addToast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        color: "success",
      });
    } catch {
      addToast({
        title: "Error",
        description: "Failed to update profile.",
        color: "danger",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      addToast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
        color: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      addToast({
        title: "Error",
        description: "Failed to update password. Check your current password.",
        color: "danger",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const passwordToggle = (
    visible: boolean,
    toggle: () => void,
    label: string
  ) => (
    <button
      type="button"
      className="focus:outline-none"
      onClick={toggle}
      aria-label={label}
    >
      {visible ? (
        <EyeOff className="pointer-events-none text-default-400" size={20} />
      ) : (
        <Eye className="pointer-events-none text-default-400" size={20} />
      )}
    </button>
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {/* Profile Section */}
      <Card>
        <CardHeader className="flex flex-col items-start gap-1 pb-0">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-default-500">
            Update your personal information
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <Input
              label="Name"
              placeholder="Your full name"
              value={name}
              onValueChange={setName}
              isRequired
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onValueChange={setEmail}
              isRequired
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                color="primary"
                isLoading={profileSaving || isLoading}
              >
                Save Profile
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader className="flex flex-col items-start gap-1 pb-0">
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="text-sm text-default-500">Change your password</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            {passwordError && (
              <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger">
                {passwordError}
              </div>
            )}

            <Input
              label="Current Password"
              type={showCurrent ? "text" : "password"}
              placeholder="Enter current password"
              value={currentPassword}
              onValueChange={setCurrentPassword}
              isRequired
              autoComplete="current-password"
              endContent={passwordToggle(
                showCurrent,
                () => setShowCurrent((v) => !v),
                showCurrent ? "Hide password" : "Show password"
              )}
            />

            <Input
              label="New Password"
              type={showNew ? "text" : "password"}
              placeholder="At least 8 characters"
              value={newPassword}
              onValueChange={(val) => {
                setNewPassword(val);
                setPasswordError(null);
              }}
              isRequired
              autoComplete="new-password"
              endContent={passwordToggle(
                showNew,
                () => setShowNew((v) => !v),
                showNew ? "Hide password" : "Show password"
              )}
            />

            <Input
              label="Confirm New Password"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat new password"
              value={confirmNewPassword}
              onValueChange={(val) => {
                setConfirmNewPassword(val);
                setPasswordError(null);
              }}
              isRequired
              autoComplete="new-password"
              endContent={passwordToggle(
                showConfirm,
                () => setShowConfirm((v) => !v),
                showConfirm ? "Hide password" : "Show password"
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                color="primary"
                isLoading={passwordSaving}
              >
                Update Password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
