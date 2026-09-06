import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { HeartDoodle } from "@/components/Decor";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const sessionId = new URLSearchParams(location.hash.slice(1)).get("session_id");
    if (!sessionId) {
      navigate("/", { replace: true });
      return;
    }
    apiGet<AuthUser>(`/auth/session-data?session_id=${encodeURIComponent(sessionId)}`)
      .then((user) => {
        setUser(user);
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/account", { replace: true, state: { user } });
      })
      .catch(() => navigate("/", { replace: true }));
  }, [location, navigate, setUser]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <HeartDoodle className="h-9 w-9 animate-float-slow text-blushdeep" />
      <p className="font-script text-3xl text-espresso/70">Signing you in ♡</p>
    </div>
  );
}
