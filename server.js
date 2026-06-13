const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(rateLimit({
windowMs:60000,
max:20
}));

// 👑 OWNER / ADMINS
const ADMINS = [
"Mahdizolfaghariofficial@gmail.com"
];

const MERCHANT = "YOUR_ZARINPAL";
const MONGO = "YOUR_MONGO_URL";

mongoose.connect(MONGO);

const Order = mongoose.model("Order",{
pack:String,
amount:Number,
status:String
});

// 💳 Pay
app.post("/pay", async (req,res)=>{
try{

let r = await axios.post("https://api.zarinpal.com/pg/v4/payment/request.json",{
merchant_id:MERCHANT,
amount:req.body.amount,
callback_url:"https://YOURDOMAIN.com/verify",
description:req.body.pack
});

let authority=r.data.data.authority;

await Order.create({
pack:req.body.pack,
amount:req.body.amount,
status:"pending"
});

res.json({
url:`https://www.zarinpal.com/pg/StartPay/${authority}`
});

}catch(e){
res.status(500).send("error");
}
});

// ✅ verify
app.get("/verify",(req,res)=>{
res.send("پرداخت موفق ✔");
});

// 📊 admin
app.get("/admin/orders",async(req,res)=>{
res.json(await Order.find());
});

// 🔐 check owner
app.post("/admin/check",(req,res)=>{
if(ADMINS.includes(req.body.email)){
res.json({ok:true});
}else{
res.json({ok:false});
}
});

app.listen(3000,()=>console.log("running"));
