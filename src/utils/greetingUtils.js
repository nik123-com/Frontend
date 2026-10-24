/**
 * greetingUtils.js
 * Utility to calculate system-time based dynamic greetings (Morning, Afternoon, Evening, Night)
 * and format user salutations according to registered gender and role (Admin, Vendor, Customer, Guest).
 */

export function getTimeGreeting(customDate = null) {
  const date = customDate instanceof Date ? customDate : new Date();
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: "Good Morning",
      timeOfDay: "morning",
      icon: "☀️",
      faIcon: "fa-solid fa-sun",
      accentColor: "#f59e0b",
      badgeClass: "bg-warning text-dark",
      wish: "Hope you have a bright and fruitful day!",
      theme: "morning"
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: "Good Afternoon",
      timeOfDay: "afternoon",
      icon: "🌤️",
      faIcon: "fa-solid fa-cloud-sun",
      accentColor: "#f97316",
      badgeClass: "bg-warning text-dark",
      wish: "Hope you are having a wonderful afternoon!",
      theme: "afternoon"
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: "Good Evening",
      timeOfDay: "evening",
      icon: "🌆",
      faIcon: "fa-solid fa-cloud-moon",
      accentColor: "#8b5cf6",
      badgeClass: "bg-primary text-white",
      wish: "Relax and enjoy your evening shopping!",
      theme: "evening"
    };
  } else {
    return {
      greeting: "Good Night",
      timeOfDay: "night",
      icon: "🌙",
      faIcon: "fa-solid fa-moon",
      accentColor: "#3b82f6",
      badgeClass: "bg-dark text-white",
      wish: "Late night essentials delivered to your doorstep!",
      theme: "night"
    };
  }
}

export function getSalutation(gender) {
  if (!gender) return "";
  const g = String(gender).trim().toLowerCase();
  if (g === "male") return "Mr.";
  if (g === "female") return "Ms.";
  return "";
}

export function getGenderBadgeInfo(gender) {
  if (!gender) return null;
  const g = String(gender).trim().toLowerCase();
  if (g === "male") {
    return { label: "Male", icon: "fa-solid fa-mars", color: "#3b82f6", symbol: "♂️" };
  }
  if (g === "female") {
    return { label: "Female", icon: "fa-solid fa-venus", color: "#ec4899", symbol: "♀️" };
  }
  return { label: "Other", icon: "fa-solid fa-genderless", color: "#8b5cf6", symbol: "⚧️" };
}

export function getUserRoleInfo() {
  const isLogin = sessionStorage.getItem("isLogin") === "true";
  const userType = sessionStorage.getItem("userType") || "";
  const rawName = sessionStorage.getItem("userId.name") || sessionStorage.getItem("name") || "";
  const gender = sessionStorage.getItem("gender") || "";
  const email = sessionStorage.getItem("email") || "";

  let role = "Guest";
  let roleBadge = "Guest Shopper";
  let roleIcon = "fa-solid fa-basket-shopping";
  let roleColor = "#64748b";

  if (isLogin) {
    if (userType === "1") {
      role = "Admin";
      roleBadge = "Administrator";
      roleIcon = "fa-solid fa-shield-halved";
      roleColor = "#dc2626";
    } else if (userType === "3") {
      role = "Vendor";
      roleBadge = "Store Partner";
      roleIcon = "fa-solid fa-store";
      roleColor = "#f59e0b";
    } else {
      role = "Customer";
      roleBadge = "Customer";
      roleIcon = "fa-solid fa-user-check";
      roleColor = "#16a34a";
    }
  }

  const salutation = getSalutation(gender);
  const cleanName = rawName.trim();

  let addressedName = "Guest";
  if (isLogin) {
    if (role === "Admin") {
      addressedName = cleanName ? `Admin ${cleanName}` : "Admin";
    } else if (role === "Vendor") {
      addressedName = cleanName ? `${salutation ? salutation + " " : ""}${cleanName}` : "Vendor Partner";
    } else {
      addressedName = cleanName ? `${salutation ? salutation + " " : ""}${cleanName}` : "Customer";
    }
  }

  return {
    isLogin,
    userType,
    name: cleanName,
    gender,
    genderInfo: getGenderBadgeInfo(gender),
    email,
    role,
    roleBadge,
    roleIcon,
    roleColor,
    salutation,
    addressedName
  };
}

export function formatTimeGreeting(userOverride = null) {
  const timeInfo = getTimeGreeting();
  const userInfo = userOverride || getUserRoleInfo();

  let formattedGreeting = "";
  if (!userInfo.isLogin) {
    formattedGreeting = `${timeInfo.greeting}, Guest!`;
  } else {
    formattedGreeting = `${timeInfo.greeting}, ${userInfo.addressedName}!`;
  }

  return {
    ...timeInfo,
    userInfo,
    formattedGreeting,
    greetingTitle: `${timeInfo.icon} ${formattedGreeting}`
  };
}
