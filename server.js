const express = require("express");
const loginOkCupid = require("./login");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await loginOkCupid(email, password);
  res.json(result || { error: "Login failed" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
});
