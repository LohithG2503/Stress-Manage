const app = require("./index");
const PORT = process.env.PORT || 5000;

const start = () => {
  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
};

start();
