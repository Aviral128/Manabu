import axios from "axios";

describe("Auth + User integration", () => {
  it("logs in and fetches profile", async () => {
    const auth = await axios.post("http://localhost:7001/v1/auth/login", {
      email: "learner@manabu.app",
      password: "StrongPass123"
    });

    expect(auth.status).toBe(200);

    const user = await axios.get("http://localhost:7002/v1/users/usr_mock_001");
    expect(user.status).toBe(200);
  });
});
