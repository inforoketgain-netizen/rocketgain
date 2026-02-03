import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ReferralRedirect = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      // Sauvegarde du parrain
      localStorage.setItem("referrer_id", code);

      console.log("Code parrain sauvegardé :", code);
    }

    // Redirection vers inscription
    navigate("/auth?mode=signup");
  }, [code, navigate]);

  
  return null;
};

export default ReferralRedirect;
