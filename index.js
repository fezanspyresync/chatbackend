const expresss = require("express");
const app = expresss();
const http = require("http");
const cors = require("cors");
const server = http.createServer(app);
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const UserModal = require("./modal/createuser");
const { boys } = require("./src/boy");
const { girls } = require("./src/girls");

const io = new Server(server, {
  cors: {
    origin: "http://192.168.39.129:3000",
  },
});

app.use(cors());
app.use(expresss.json());
app.use(expresss.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("hello");
});
//database

mongoose
  .connect(
    "mongodb://hussaini:hussaini@ac-wh7dgtp-shard-00-00.wfmewfd.mongodb.net:27017,ac-wh7dgtp-shard-00-01.wfmewfd.mongodb.net:27017,ac-wh7dgtp-shard-00-02.wfmewfd.mongodb.net:27017/gamechanger?ssl=true&replicaSet=atlas-l6p6pj-shard-0&authSource=admin&retryWrites=true&w=majority"
  )
  .then(() => console.log("database Connected!"))
  .catch((error) => {
    console.log("erroe while connection");
  });

//server
server.listen(3000, () => {
  console.log("server is running");
});

//userAccountHandler
const createNewUser = async (user, gender) => {
  const userPayload = {
    name: user,
    messages: [],
    isLive: false,
    image: gender == "boy" ? boys[0].image : girls[0].image,
    isChating: false,
    chatingPerson: "",
  };

  const userCollection = new UserModal(userPayload);
  await userCollection
    .save()
    .then(() => {
      console.log("user is created");
    })
    .catch((error) => {
      console.log("no user is created");
    });
};

//socket functionality
io.on("connection", (socket) => {
  console.log(`${socket.id}a device is connected`);
  //creaete user
  socket.on("createuser", (user, gender) => {
    console.log(user);
    createNewUser(user, gender);
  });
  socket.on("currentUser", async (currentUser) => {
    console.log("currentUser", currentUser);
    await UserModal.findOneAndUpdate(
      { user: currentUser.name },
      { isLive: currentUser.isLive }
    );
    //user is Live

    //findAllUsersExceptOnline
    const AllUsers = await UserModal.find();
    const Filter = AllUsers.filter((data) => data.name !== currentUser.user);
    socket.emit("getAllUsers", Filter);

    // Close the connection
  });

  //offline handler
  const offlineHandler = (currentUserOffLine) => {
    UserModal.fineOneAndUpdate(
      { user: currentUserOffLine.user },
      { isLive: currentUserOffLine.isLive }
    );
  };
  socket.on("currentUserOffline", (currentUserOffLine) => {
    console.log("offline User", currentUserOffLine.isLive);
    offlineHandler(currentUserOffLine);
  });
});
