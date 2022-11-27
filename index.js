const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion } = require("mongodb");

// dotenv
require("dotenv").config()

const app = express();
const port = process.env.port || 8000;

// middleware
app.use(cors());

app.use(express.json());


console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yyqnrtj.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

async function run() {
	try {
		
        const productsCollection = client.db("resaleproduct").collection("products");
        
        
		



			
	
	
	

		

		
		

	
		

		
	} finally {
	}
}

run().catch((err) => console.log(err));








app.get("/", (req, res) => {
	res.send("Server is Running ");
});

app.listen(port, () => {
	console.log(`Product Server is Running ${port}`);
});