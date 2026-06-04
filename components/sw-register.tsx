"use client";

import { useEffect } from "react";

const SwRegister = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Ignore registration failure for unsupported contexts.
    });
  }, []);

  return null;
};

export default SwRegister;
