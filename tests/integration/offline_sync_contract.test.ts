import axios from "axios";

describe("Offline sync contract", () => {
  it("submits offline batch and receives sync job id", async () => {
    const response = await axios.post("http://localhost:7010/v1/sync/offline-batch", {
      userId: "usr_777",
      events: [
        { id: "evt1", type: "quiz_answer", payload: { answer: 2 }, timestamp: new Date().toISOString() }
      ]
    });

    expect(response.status).toBe(200);
    expect(response.data.syncJobId).toContain("sync_job");
  });
});
