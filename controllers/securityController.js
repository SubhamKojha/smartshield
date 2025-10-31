let securityEnabled = false;

export const toggleSecurity = (req, res) => {
  securityEnabled = !securityEnabled;
  console.log(`🛡️ Security system is now ${securityEnabled ? "ENABLED" : "DISABLED"}`);
  res.json({ active: securityEnabled });
};

export const getSecurityStatus = (req, res) => {
  res.json({ active: securityEnabled });
};

// helper to let ESP32 check if system is active
export const isSecurityActive = () => securityEnabled;
