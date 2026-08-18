// =====================================================
// LICENSE STATUS UTILITY
// =====================================================

export function getLicenseStatus(expiryDate) {

  // No expiry date
  if (!expiryDate) {
    return {
      label: "NO EXPIRY",
      className: "no-expiry",
      daysRemaining: null,
    };
  }

  // Convert expiry date to local date
  const expiry = new Date(`${expiryDate}T00:00:00`);

  // Invalid date
  if (Number.isNaN(expiry.getTime())) {
    return {
      label: "UNKNOWN",
      className: "no-expiry",
      daysRemaining: null,
    };
  }

  // Today at midnight
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  // Difference in milliseconds
  const difference =
    expiry.getTime() - today.getTime();

  // Convert to days
  const daysRemaining = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  // ===================================================
  // EXPIRED
  // ===================================================

  if (daysRemaining < 0) {
    return {
      label: "EXPIRED",
      className: "expired",
      daysRemaining,
    };
  }

  // ===================================================
  // EXPIRING SOON
  // 30 days or less
  // ===================================================

  if (daysRemaining <= 30) {
    return {
      label: "EXPIRING SOON",
      className: "expiring",
      daysRemaining,
    };
  }

  // ===================================================
  // ACTIVE
  // ===================================================

  return {
    label: "ACTIVE",
    className: "active",
    daysRemaining,
  };
}