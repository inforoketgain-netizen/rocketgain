import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ReferralRedirect = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      localStorage.setItem("referrer_id", code);
    }
    navigate("/auth?mode=signup");
  }, [code, navigate]);

  return null;
};

export default ReferralRedirect;
