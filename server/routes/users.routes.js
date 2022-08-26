const express = require("express");
const userRoute = express.Router();
const fs = require("fs");
const path = require("path");
const usersPath = path.join(__dirname, "../jsons/users.json");
// console.log(usersPath);

//get all users data
userRoute.get("/users", (req, res) => {
  try {
    const users = loadUsers();
    res.status(200).send(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//get specific user data by id
userRoute.get("/users/:userId", (req, res) => {
  try {
    const users = loadUsers();
    const id = Number(req.params.userId); //req.params.userId typeof is a string
    const userInfo = users.find((user) => {
      return user.userId === id;
    });
    console.log(userInfo);
    if (userInfo === undefined) throw new Error("User not found!");
    res.status(200).send(userInfo);
  } catch (e) {
    // console.log(e.message);
    res.status(400).send(e.message);
  }
});

//add new user
userRoute.post("/users", (req, res) => {
  try {
    const users = loadUsers();
    const newUser = {
      userId: req.body.userId || "",
      name: req.body.name || "",
      accounts: req.body.accounts || [],
    };
    const userToCheck = users.find((user) => user.userId === newUser.userId);
    if (userToCheck) throw new Error("User is already exit!");
    users.push(newUser);
    saveNewUser(users);
    res.status(200).send(newUser);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

const loadUsers = () => {
  try {
    const dataBuffer = fs.readFileSync(usersPath);
    const dataJSON = dataBuffer.toString();
    const data = JSON.parse(dataJSON);
    return data;
  } catch (e) {
    return [];
  }
};

const saveNewUser = (users) => {
  try {
    const usersJson = JSON.stringify(users);
    console.log("usersJson", usersJson);
    fs.writeFileSync(usersPath, usersJson);
  } catch (e) {
    console.log(e);
  }
};

// const createUser = (name, email) => {
//   const users = loadUsers();
//   // const userById = users.find((user) => user.id === id);
//   // if (!userById) {
//   users.push({
//     name: name,
//     email: email,
//     id: uniqid(),
//   });
//   saveUsers(users);

//   console.log(chalk.green.inverse("Added new user!"));
// };

module.exports = { userRoute, loadUsers };
// module.exports = loadUsers;
