const express = require("express");
const cors = require("cors");

const jwt = require("jsonwebtoken");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// dotenv
require("dotenv").config()

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
console.log(stripe)

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

// veryfi jwt
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    
	if (!authHeader) {
		return res.status(401).send("unauthorized access");
	}

	const token = authHeader.split(" ")[1];

jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,
function (err, decoded) {
if (err) {
	return res.status(403).send({ message: "forbidden access" });
	}
	req.decoded = decoded;
	next();
	}
	);
}
async function run() {
	try {
		const productsCollection = client
			.db("resaleproduct")
			.collection("products");

		const bookingsCollection = client
			.db("resaleproduct")
			.collection("booking");

		// payment Collection
		const paymentsCollection = client
			.db("resaleproduct")
			.collection("payments");

		const usersCollection = client
			.db("resaleproduct")
			.collection("users");

		app.get("/allProduct", async (req, res) => {
			const query = {};
			const cursor = await productsCollection
				.find(query)
				.toArray();

			res.send(cursor);
		});

		// Verify Admin
		const verifyAdmin = async (req, res, next) => {
			const decodedEmail = req.decoded.email;
			const query = { email: decodedEmail };
			const user = await usersCollection.findOne(query);

			if (user?.role !== "admin") {
				return res
					.status(403)
					.send({ message: "forbidden access" });
			}
			next();
		};

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
				const token = jwt.sign(
					{ email },
					process.env.ACCESS_TOKEN_SECRET,
					{ expiresIn: "1d" }
				);

				return res.send({ getToken: token });
			}

			res.status(403).send({ getToken: "" });
		});

		// get booking data
		app.get("/bookings", verifyJWT, async (req, res) => {
			const email = req.query.email;

			console.log("Token", req.headers.authorization);

			const decodedEmail = req.decoded.email;

			if (email !== decodedEmail) {
				return res
					.status(403)
					.send({ message: "forbidden access" });
			}

			const query = { email: email };
			const bookings = await bookingsCollection
				.find(query)
				.toArray();

			res.send(bookings);
		});

		// particular id
		app.get("/bookings/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const booking = await bookingsCollection.findOne(query);
			res.send(booking);
		});

		// user information save database
		app.post("/users", async (req, res) => {
			const user = req.body;
			console.log(user);
			const result = await usersCollection.insertOne(user);
			res.send(result);
		});

		// get All user
		app.get("/users", async (req, res) => {
			const query = {};
			const users = await usersCollection.find(query).toArray();
			res.send(users);
		});
		// Is Admin
		app.get("/users/admin/:email", async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const user = await usersCollection.findOne(query);
			res.send({ isAdmin: user?.role === "admin" });
		});

		
		// Stripe
		app.post("/create-payment-intent", async (req, res) => {
			const booking = req.body;
			const price = booking.price;
			const amount = price * 100;

			const paymentIntent = await stripe.paymentIntents.create({
				currency: "usd",
				amount: amount,
				payment_method_types: ["card"],
			});

			res.send({
				clientSecret: paymentIntent.client_secret,
			});
		});

	// Payment Collection
		app.post("/payments", async (req, res) => {
			const payment = req.body;
			const result = await paymentsCollection.insertOne(payment);
			const id = payment.bookingId;
			const filter = { _id: ObjectId(id) };
			const updatedDoc = {
				$set: {
					paid: true,
					transactionId: payment.transactionId,
				},
			};
			const updatedResult = await bookingsCollection.updateOne(
				filter,
				updatedDoc
			);
			res.send(result);
		});

		// update
		app.put(
			"/users/admin/:id",
			verifyJWT,
			verifyAdmin,
			async (req, res) => {
				const query = { email: decodedEmail };
				const user = await usersCollection.findOne(query);

				const id = req.params.id;
				const filter = { _id: ObjectId(id) };
				const options = { upsert: true };

				const updatedDoc = {
					$set: {
						role: "admin",
					},
				};

				const result = await usersCollection.updateOne(
					filter,
					updatedDoc,
					options
				);
				res.send(result);
			}
		);

		// Admin   delete user
		app.delete(
			"/users/:id",
			verifyJWT,
			verifyAdmin,
			async (req, res) => {
				const id = req.params.id;
				const filter = { _id: ObjectId(id) };
				const result = await usersCollection.deleteOne(
					filter
				);
				res.send(result);
			}
		);
	}


    
    finally {
	}
}

run().catch((err) => console.log(err));








app.get("/", (req, res) => {
	res.send("Server is Running ");
});

app.listen(port, () => {
	console.log(`Product Services Server is Running ${port}`);
});