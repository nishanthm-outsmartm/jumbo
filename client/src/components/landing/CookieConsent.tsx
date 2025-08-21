import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const COOKIE_KEY = "cookie_consent_accepted";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_KEY, "true");
    setVisible(false);
  };

  const declineCookies = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center px-1 pointer-events-none">
      <div
        className="
          bg-white border border-gray-200 shadow-lg rounded-t-xl
          w-full max-w-xl
          flex flex-col xs:flex-row items-center gap-3
          px-3 py-3 xs:px-4 xs:py-4
          pointer-events-auto
        "
      >
        <div className="flex-1 text-gray-700 text-xs xs:text-sm text-center xs:text-left">
          We use cookies to enhance your experience. By continuing to browse,
          you agree to our use of cookies.{" "}
          <a
            href="/privacy"
            className="underline text-orange-600 hover:text-orange-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
          </a>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 w-full xs:w-auto">
          <Button
            size="sm"
            className="bg-orange-600 text-white hover:bg-orange-700 w-full xs:w-auto"
            onClick={acceptCookies}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full xs:w-auto"
            onClick={declineCookies}
          >
            Decline
          </Button>
        </div>
        <button
          className="ml-0 xs:ml-2 text-gray-400 hover:text-gray-600"
          aria-label="Close"
          onClick={declineCookies}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
