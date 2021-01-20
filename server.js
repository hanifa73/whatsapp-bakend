//importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher   from "pusher";
import cors from "cors";


//app config
const app=express();
const port=process.env.PORT || 9000

const pusher = new Pusher({
  appId: "1140631",
  key: "34e9903e71ecc4fe1711",
  secret: "d75aa1a9466b593dbff4",
  cluster: "ap2",
  useTLS: true
});

//middleware
app.use(express.json());
app.use(cors());

//DB config

const connection_url='mongodb+srv://admin:Ln5uGXvhVFtRmYrE@cluster0.dngl2.mongodb.net/whatsappdb?retryWrites=true&w=majority'
mongoose.connect(connection_url,{
     useUnifiedTopology: true,
     useNewUrlParser: true,
     useCreateIndex: true 

})


const db = mongoose.connection;

db.once("open", () => {
    console.log("DB connected...");
const msgCollection = db.collection("messagecontents");
const changeStream = msgCollection.watch();

changeStream.on("change", (change) =>{ 
    
   console.log(change); 

   if (change.operationType ==='insert'){
            const messageDetails= change.fullDocument;
            pusher.trigger('messages','inserted',{
                
                name: messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                received:messageDetails.received,
            }
            );
        }else{
            console.log('Error triggering Pusher')

            }
           


    });
})
app.get("/",(req,res)=>res.status(200).send('hello world'));


app.get('/messages/sync', (req,res) => {
    Messages.find((err, data) => {
        if(err){
            res.status(500).send(err)
        } else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req,res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if(err){
            res.status(500).send(err)
        } else{
            res.status(201).send(data)
        }
    })
})
//listen
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))




