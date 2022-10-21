const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.static("./app")).listen(3000, () => console.log(`Server listening on port: 3000`));

app.use(express.static("./mock/general")).listen(3001, () => console.log(`Server listening on port: 3001`));
app.use(express.static("./mock/intent-a")).listen(3100, () => console.log(`Server listening on port: 3100`));
app.use(express.static("./mock/intent-b")).listen(3101, () => console.log(`Server listening on port: 3101`));
app.use(express.static("./mock/intent-c")).listen(3102, () => console.log(`Server listening on port: 3102`));
app.use(express.static("./mock/channels")).listen(3103, () => console.log(`Server listening on port: 3103`));
