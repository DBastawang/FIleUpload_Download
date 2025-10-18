export function UseAuthentication() {
  async function login(username, password) {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include", 
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();

      localStorage.setItem("user", data.user.username);
      localStorage.setItem("role", data.user.role);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("user");
      return await response.text();
    } catch (error) {
      throw error;
    }
  }

  return {
    login,
    logout,
  };
}
