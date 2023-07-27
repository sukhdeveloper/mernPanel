const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const engines = require("consolidate");

const dotenv = require("dotenv");
const LikeTrend = require("./models/LikeTrend");
const PageHistory = require("./models/UserHistory"); 

dotenv.config();
const cors = require("cors");
var compression = require("compression");
const app = express();
app.use(cors());
app.use(
  compression({
    level: 9,
  })
);
app.use(
  compression({
    level: 9,
  })
);
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:9000",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  return next();
});
connectDB();
app.use(express.json({ limit: "50mb" }));
app.use(express.json({ extended: false }));
app.use("/public", express.static("uploads"));

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use("/v1/admin", require("./routes/api/admin/login"));
app.use("/v1/frontend", require("./routes/api/frontend"));
// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
const PORT = 5000;

// socket start

const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true,
  },
});

// socket start
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/socket/index.html");
});

io.on("connection", (socket) => {
  socket.on("createRoom", (roomName) => {
    socket.join("room-" + roomName);
    io.sockets.in("room-" + roomName).emit("connectToRoom", "room-" + roomName);
    // io.sockets.on("connectToRoom", (msg) => {
    //   io.sockets.in("room-" + roomName).emit("chat message", msg);
    // });
  });
  socket.on("trend_liked", async (data) => {
    const likeStatus = await LikeTrend.findOne({
      trend_id: data.trend_id,
      user_id: data.user_id,
    });
    if (likeStatus && likeStatus.like_dislike == true) {
      const removedData = await LikeTrend.remove({ _id: likeStatus._id });
      if (removedData) {
        // const totalLikes = await LikeTrend.find({
        //   trend_id: data.trend_id,
        //   like_dislike: true,
        // });
        io.sockets.in(data.room).emit("trend_liked", {
          trend_id: data.trend_id,
          user_id: data.user_id,
        });
      }
    } else {
      if (likeStatus) {
        const removedData = await LikeTrend.remove({ _id: likeStatus._id });
      }
      var saveData = new LikeTrend({
        trend_id: data.trend_id,
        user_id: data.user_id,
        like_dislike: true,
      });
      const saveLike = await saveData.save();
      if (saveLike) {
        // const totalLikes = await LikeTrend.find({
        //   trend_id: data.trend_id,
        //   like_dislike: true,
        // });
        io.sockets.in(data.room).emit("trend_liked", {
          trend_id: data.trend_id,
          user_id: data.user_id,
        });
      }
    }
    //io.sockets.in(data.room).emit("trend_liked", data.msg);
  });
  socket.on("trend_disliked", async (data) => {
    const likeStatus = await LikeTrend.findOne({
      trend_id: data.trend_id,
      user_id: data.user_id,
    });

    if (likeStatus && likeStatus.like_dislike == 0) {
      const removedData = await LikeTrend.remove({ _id: likeStatus._id });
      if (removedData) {
        // const totalDisLikes = await LikeTrend.find({
        //   trend_id: data.trend_id,
        //   like_dislike: false,
        // });
        io.sockets.in(data.room).emit("trend_disliked", {
          trend_id: data.trend_id,
          user_id: data.user_id,
        });
      }
    } else {
      if (likeStatus) {
        const removedData = await LikeTrend.remove({ _id: likeStatus._id });
      }
      var saveData = new LikeTrend({
        trend_id: data.trend_id,
        user_id: data.user_id,
        like_dislike: false,
      });
      const saveLike = await saveData.save();
      if (saveLike) {
        // const totalDisLikes = await LikeTrend.find({
        //   trend_id: data.trend_id,
        //   like_dislike: false,
        // });
        io.sockets.in(data.room).emit("trend_disliked", {
          trend_id: data.trend_id,
          user_id: data.user_id,
        });
      }
    }
  });
  socket.on("add_comment",async (data) => {

    io.sockets.in(data.room).emit("get_new_comment", {
      trend_id: data.trend_id,
      pageNo:1,
      data:data
    });
  });
  socket.on("get_new_comment",async (data) => {
    console.log("page loaded");
    io.sockets.in(data.room).emit("get_new_comment", {
      trend_id: data.trend_id,
      pageNo:1
    });
  });
  socket.on("new_page_open", async (data) => {
    var saveData = new PageHistory({
      user_ip: data.user_ip,
      page_visited_url: data.page_visited_url,
      created_at: new Date(),
    });
    const saveDataRecord = await saveData.save();
    console.log(data)
    if(saveDataRecord){
      io.sockets.in(data.user_ip).emit("new_page_open", {
        data: saveDataRecord
      });
    }
    //io.sockets.in(data.room).emit("trend_liked", data.msg);
  });
  socket.on("update_history", async (data) => {
   const savedata = {
      time_spent:data.time_spent,
      updated_at: new Date(),
   }
   const myLastRecord = await PageHistory.findOne({
    user_ip: data.user_ip,
    page_visited_url: data.page_visited_url,
  }).sort({created_at:-1});
    const update_history = await PageHistory.findOneAndUpdate({_id : myLastRecord._id
    },{ $set: savedata });
    if(update_history){
      io.sockets.in(data.user_ip).emit("update-history", {
        data: update_history
      });
    }
    //io.sockets.in(data.room).emit("trend_liked", data.msg);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
