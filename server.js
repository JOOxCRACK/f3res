const express = require("express");
const axios = require("axios");
const app = express();

// السماح بقراءة JSON من الريكوست
app.use(express.json());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await axios.post(
      "https://e2p-okapi.api.okcupid.com/graphql?operationName=WebLoginWithEmail",
      {
        operationName: "WebLoginWithEmail",
        variables: {
          input: {
            email,
            password,
          },
        },
        query: `mutation WebLoginWithEmail($input: AuthEmailLoginInput!) {
          authEmailLogin(input: $input) {
            encryptedUserId
            status
            token
            __typename
          }
        }`,
      },
      {
        headers: {
          "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjb3JlYXBpIiwiYXVkIjoiY29yZWFwaSIsInBsYXRmb3JtSWQiOjExMiwic2Vzc2lvbklkIjoiNTljNGMxYWQtMmY0ZC00MDk1LWIzOWYtMTM4MGY1MjAwZmQwIiwic2l0ZUNvZGUiOjM2LCJTZXJ2ZXJJZCI6NzksInZlciI6MTIsImlzc1NyYyI6MjcsImVudiI6MSwic2NvcGUiOlsxXSwiYXV0aF90aW1lIjpudWxsLCJpYXQiOjE3NTIxNTc3MzAsImV4cCI6MTc1MjE2MDQzMH0.OMVJSMJ8hcrjD3zCd61XJCfdTeRUO_QuTftIEoIM70M", // ✅ حط التوكن الحقيقي هنا
          "content-type": "application/json",
          "origin": "https://www.okcupid.com",
          "referer": "https://www.okcupid.com/",
          "sec-ch-ua": `"Chromium";v="134", "Not: A-Brand";v="24", "Google Chrome";v="134"`,
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": `"Windows"`,
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
          "x-okcupid-auth-v": "1",
          "x-okcupid-device-id": "1e3b554a70cf70ed",
          "x-okcupid-locale": "en",
          "x-okcupid-platform": "DESKTOP",
          "x-okcupid-version": "204",
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Login failed or blocked by Cloudflare");
  }
});

// ✅ هنا السطر الأهم عشان السيرفر يشتغل
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
