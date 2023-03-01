console.log("preloading!");
Object.defineProperty(window, "isElectron", { get: () => true });
