import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ReferralInput({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!code || !user) return;

    setLoading(true);

    // Cherche le parrain via son own_referral_code
    const { data: referrer } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("own_referral_code", code)
      .maybeSingle();

    if (!referrer) {
      alert("Code invalide");
      setLoading(false);
      return;
    }

    // Met à jour le profil du filleul
    const { error } = await supabase
      .from("profiles")
      .update({ referred_by: referrer.user_id })
      .eq("user_id", user.id);

    if (error) {
      alert("Erreur lors de l'enregistrement");
    } else {
      localStorage.removeItem("referrer_id");
      onSuccess(); // débloque le dashboard
    }

    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Code de parrainage"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border rounded p-2 w-full"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-primary text-white w-full p-2 rounded"
      >
        {loading ? "Vérification..." : "Valider le code"}
      </button>
    </div>
  );
}
