const express = require("express");
const cors = require("cors");

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
		

        
        // get booking data
app.get("/bookings",  async (req, res) => {
	const email = req.query.email;

	

	const query = { email: email };
	const bookings = await bookingsCollection.find(query).toArray();

	res.send(bookings);
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