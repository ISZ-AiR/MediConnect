import { apiRequest } from "./apiClient";

export const usersService = {
  async getAllUsers() {
    try {
      const response = await apiRequest("/users/", { requiresAuth: true });
      // response ma format { success: true, data: [...] }
      const users = response.data || [];
      // zwracamy dokładnie te same pola co backend
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

    async updateUser(userId, payload) {
      try {
        const response = await apiRequest(`/users/${userId}/`, {
          method: "PUT",
          requiresAuth: true,
          body: JSON.stringify(payload), // <- ważne
        });
        return response.data;
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    },

  async deleteUser(userId) {
    try {
      const response = await apiRequest(`/users/${userId}/`, {
        method: "DELETE",
        requiresAuth: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};
