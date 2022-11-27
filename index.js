const express = require("express");
const cors = require("cors");


const app = express();

const port = process.env.port || 8000;

// middleware
app.use(cors());

app.use(express.json());


app.get("/", (req, res) => {
	res.send("Server is Running ");
});

app.listen(port, () => {
	console.log(`Product Server is Running ${port}`);
});