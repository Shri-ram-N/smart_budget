
export let categoryConfig = {
    Food: {
        color: "#159B62",
        background: "#E5F6EC",
        darkColor: "#4ADE80",
        darkBackground: "#193A29",
        icon: "fa-solid fa-utensils"
    },
    Transport: {
        color: "#D88922",
        background: "#FFF1DB",
        darkColor: "#FDBA74",
        darkBackground: "#3D2B1C",
        icon: "fa-solid fa-bus"
    },
    Shopping: {
        color: "#8754C7",
        background: "#F0E6FC",
        darkColor: "#C4B5FD",
        darkBackground: "#302442",
        icon: "fa-solid fa-cart-shopping"
    },
    Bills: {
        color: "#3978D4",
        background: "#E6EFFF",
        darkColor: "#60A5FA",
        darkBackground: "#1D3045",
        icon: "fa-solid fa-receipt"
    },
    Entertainment: {
        color: "#D74783",
        background: "#FCE7F0",
        darkColor: "#F472B6",
        darkBackground: "#402333",
        icon: "fa-solid fa-film"
    },
    Health: {
        color: "#169B91",
        background: "#DFF5F1",
        darkColor: "#2DD4BF",
        darkBackground: "#193B38",
        icon: "fa-solid fa-heart-pulse"
    },
    Utilities: {
        color: "#B58A16",
        background: "#FBF2D7",
        darkColor: "#FACC15",
        darkBackground: "#3B301B",
        icon: "fa-solid fa-bolt"
    },
    Others: {
        color: "#748195",
        background: "#EBEFF4",
        darkColor: "#A1A1AA",
        darkBackground: "#292D2A",
        icon: "fa-solid fa-ellipsis"
    },
    Income: {
        color: "#238647",
        background: "#E2F4E6",
        darkColor: "#86EFAC",
        darkBackground: "#193A29",
        icon: "fa-solid fa-wallet"
    },
    Savings: {
        color: "#0D9488",
        background: "#DDF8F3",
        darkColor: "#5EEAD4",
        darkBackground: "#193B38",
        icon: "fa-solid fa-piggy-bank"
    },
    Salary: {
        color: "#166534",
        background: "#DCFCE7",
        darkColor: "#22C55E",
        darkBackground: "#163522",
        icon: "fa-solid fa-money-check-dollar"
    },
    Freelance: {
        color: "#2563EB",
        background: "#DBEAFE",
        darkColor: "#93C5FD",
        darkBackground: "#1D3045",
        icon: "fa-solid fa-laptop-code"
    },
    Rental: {
        color: "#C2410C",
        background: "#FFEDD5",
        darkColor: "#FB923C",
        darkBackground: "#3D2519",
        icon: "fa-solid fa-house"
    },
    Passive: {
        color: "#0F766E",
        background: "#CCFBF1",
        darkColor: "#99F6E4",
        darkBackground: "#163936",
        icon: "fa-solid fa-coins"
    },
    Investment: {
        color: "#6D28D9",
        background: "#EDE9FE",
        darkColor: "#A78BFA",
        darkBackground: "#302442",
        icon: "fa-solid fa-arrow-trend-up"
    }
};

export function getCategory(categoryName) {
    let category = categoryConfig[categoryName] ?? categoryConfig.Others;
    let isDarkMode = document.body.classList.contains("dark-mode");

    return {
        color: isDarkMode ? category.darkColor : category.color,
        background: isDarkMode ? category.darkBackground : category.background,
        icon: category.icon
    };
}
