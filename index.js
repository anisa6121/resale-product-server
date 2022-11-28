const express = require("express");
const cors = require("cors");

const jwt = require("jsonwebtoken");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

        const bookingsCollection = client.db("resaleproduct").collection("booking") 
        
const usersCollection = client.db("resaleproduct").collection("users");     
        app.get("/allProduct", async (req, res) => {
            const query = {};
            const cursor = await productsCollection.find(query).toArray();
            res.send(cursor)

   })   

        // Booking Product
     app.post("/bookings", async (req, res) => {
              
	const booking = req.body;
      console.log(booking);
              
const result = await bookingsCollection.insertOne(booking);
		res.send(result);
	});     
   
        // Single Product Information
    app.get("/singleProduct/:id", async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const product = await productsCollection.findOne(query);
		res.send(product); 
    });
        
        
        
// jwt Token
app.get("/jwt", async (req, res) => {
	const email = req.query.email;
	const query = { email: email };
	const user = await usersCollection.findOne(query);

	console.log(user);

if (user) {
const token = jwt.sign({ email },process.env.ACCESS_TOKEN_SECRET,{ expiresIn: "1d" });

	return res.send({ getToken: token });
}

res.status(403).send({ getToken: "" });
});
       
        
// get booking data
app.get("/bookings",  async (req, res) => {
	const email = req.query.email;

	 console.log('Token',req.headers.authorization);

	

	const query = { email: email };
	const bookings = await bookingsCollection.find(query).toArray();

	res.send(bookings);
});

// user information save database
app.post("/users", async (req, res) => {
	const user = req.body;
	console.log(user);
	const result = await usersCollection.insertOne(user);
	res.send(result);
});
			
	
	
	

		

		
		

	
		

		
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