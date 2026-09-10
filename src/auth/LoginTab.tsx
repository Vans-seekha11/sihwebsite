import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./Icons";

export default function LoginTab({ onLogin }: { onLogin?: (identity: string) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onLogin?.(email);
      }}
      style={{ fontFamily: "'Noto Sans', sans-serif" }}
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-xs font-medium uppercase tracking-wide"
          style={{ fontFamily: "'Public Sans', sans-serif", color: "#5B6472", letterSpacing: "0.06em" }}
        >
          Email / Username
        </label>
        <input
          id="email"
          type="text"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="officer@gov.in or employee ID"
          className="glass-field accent-saffron"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-xs font-medium uppercase tracking-wide"
            style={{ fontFamily: "'Public Sans', sans-serif", color: "#5B6472", letterSpacing: "0.06em" }}
          >
            Password
          </label>
          <a
            href="#"
            className="text-xs transition-colors"
            style={{ color: "#5B6472", textDecoration: "underline" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0E2A47")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#5B6472")}
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="glass-field accent-saffron has-toggle"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{ color: "#5B6472", background: "none", border: "none", cursor: "pointer", padding: "2px" }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 text-sm font-semibold transition-colors mt-1"
        style={{
          backgroundColor: "#0E2A47",
          color: "#ffffff",
          borderRadius: "4px",
          border: "1px solid #0E2A47",
          fontFamily: "'Public Sans', sans-serif",
          cursor: "pointer",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1B3F63")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0E2A47")}
      >
        Log In
      </button>

      <p
        className="text-xs text-center leading-relaxed"
        style={{ color: "#5B6472", fontFamily: "'Noto Sans', sans-serif" }}
      >
        Access is provisioned by your district administrator.
      </p>
    </form>
  );
}
