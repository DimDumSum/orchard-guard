"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "operator", label: "Spray Operator" },
  { value: "scout", label: "Scout / Monitor" },
  { value: "foreman", label: "Foreman" },
  { value: "picker", label: "Picker" },
  { value: "pruner", label: "Pruner" },
  { value: "manager", label: "Manager" },
  { value: "other", label: "Other" },
] as const;

const NOTIFICATION_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "both", label: "Both" },
] as const;

export function AddWorkerForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [notificationPreference, setNotificationPreference] = useState("email");

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (!name.trim()) {
        throw new Error("Worker name is required.");
      }

      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orchardId: 1,
          name: name.trim(),
          phone: phone || null,
          email: email || null,
          role: role || null,
          notificationPreference,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to add worker");
      }

      // Reset form
      setName("");
      setPhone("");
      setEmail("");
      setRole("");
      setNotificationPreference("email");

      setFeedback({ type: "success", message: "Worker added successfully." });
      router.refresh();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="size-5" />
          Add Worker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="worker-name">Name</Label>
              <Input
                id="worker-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="worker-phone">Phone</Label>
              <Input
                id="worker-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="worker-email">Email</Label>
              <Input
                id="worker-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="worker@example.com"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(val) => val && setRole(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notification Preference */}
            <div className="space-y-1.5">
              <Label>Notifications</Label>
              <Select
                value={notificationPreference}
                onValueChange={(val) =>
                  val && setNotificationPreference(val)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_OPTIONS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                  : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Worker"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
