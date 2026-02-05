export const mockAuth = {
    login: async (email: string, password: string) => {
        await new Promise(r => setTimeout(r, 500));
        if (email === "test@test.com" && password === "123456") return { success: true };
        return { success: false, message: "Email ou mot de passe incorrect" };
    },
    register: async (email: string, password: string) => {
        await new Promise(r => setTimeout(r, 500));
        if (email && password) return { success: true };
        return { success: false, message: "Veuillez remplir tous les champs" };
    }
};

export const mockBoards = [
    {
        id: "1", name: "Projet A", columns: [
            { id: "c1", name: "À faire", cards: [{ id: "k1", title: "Task 1" }] },
            { id: "c2", name: "En cours", cards: [] },
        ]
    },
    { id: "2", name: "Projet B", columns: [] }
];