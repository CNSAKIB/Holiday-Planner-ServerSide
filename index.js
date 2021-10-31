const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extented: true }));



// --------------------------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2vlh5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        // console.log("Hitting the database");
        const serviceCollection = client.db("holidayPlanner").collection("services");
        const orderCollection = client.db("holidayPlanner").collection("orders");

        // Add Services
        app.post('/addServices', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            console.log('got new user', newService);
            console.log('added user', result);
            res.json(result);
        });
        app.post('/addBooking', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            console.log('got new user', newOrder);
            console.log('added user', result);
            res.json(result);
        });

        // Get Services
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await serviceCollection.findOne(query);
            res.send(user);
        })
        app.get('/orders/:email', async (req, res) => {

            const result = await orderCollection.find({ email: req.params.email }).toArray();
            res.send(result);
        })
        // Cancel Orders
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);

            console.log('deleting user with id ', result);

            res.json(result);
        })
        // Approve Order
        app.put('/approveOrder/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Approved"
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


// ---------------------------------------

app.get('/', (req, res) => {
    res.send('Holiday-Planner server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})