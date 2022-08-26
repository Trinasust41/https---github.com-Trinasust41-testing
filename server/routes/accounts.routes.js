const express = require("express");
const routeAccount = express.Router();
const fs = require("fs");
const path = require("path");
const accountsPath = path.join(__dirname, "../jsons/accounts.json");
const { loadUsers } = require("./users.routes");

//get all accounts data
routeAccount.get("/accounts", (req, res) => {
  try {
    const accounts = loadAccounts();
    res.status(200).send(accounts);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//get specific account data by user id and account id
routeAccount.get("/accounts/:userId/:accountId", (req, res) => {
  try {
    const accounts = loadAccounts();
    const userId = Number(req.params.userId); //req.params.userId typeof is a string
    const accountId = req.params.accountId; //string
    //check match between account and user ids and validation of input:
    const accountInfo = checkForUserAccountValidation(accounts, userId, accountId);
    res.status(200).send(accountInfo);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//add new account of specific user only if the account defined in the user object:
routeAccount.post("/accounts/:userId", (req, res) => {
  try {
    let accounts = loadAccounts();
    const id = Number(req.params.userId);
    const users = loadUsers();
    const newAccount = {
      accountId: req.body.accountId || "",
      cash: req.body.cash || 0,
      credit: req.body.credit || 0,
      isActive: req.body.isActive || true,
    };
    //get the specifit user object
    const userToCheck = users.find((user) => {
      return user.userId === id;
    });
    if (userToCheck === undefined) throw new Error("User is not found!");
    //check if user has the account id in his array
    const isAccountExistInUser = userToCheck.accounts.find((accountId) => accountId === newAccount.accountId);

    //check if account is exist in the account object json, beacaue if it exist I don't want to create another one
    const isAccountExistInAccounts = accounts.find((account) => account.accountId === newAccount.accountId);
    if (isAccountExistInUser && !isAccountExistInAccounts) {
      accounts.push(newAccount);
    } else if (!isAccountExistInUser) {
      throw new Error("Account is not belong to that user.");
    } else if (isAccountExistInAccounts) {
      throw new Error("Account is already defined.");
    }
    saveNewAccount(accounts);
    res.status(200).send(newAccount);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//deposit cash to a user by userId and accountId and amount:
routeAccount.put("/deposit/:userId/:accountId", (req, res) => {
  try {
    let accounts = loadAccounts();
    const newCash = req.body.newCash; //req.body.cash?
    const userId = Number(req.params.userId); //req.params.userId typeof is a string
    const accountId = req.params.accountId; //string
    //check match between account and user ids:
    const accountInfo = checkForUserAccountValidation(accounts, userId, accountId);
    //in the case the account is not active:
    if (accountInfo.isActive === false) {
      throw new Error(`Account  ${accountInfo.accountId} is not active!`);
    }
    const newCashAmount = accountInfo.cash + newCash;
    let updatedAccounts = accounts.map((account) => {
      if (account.accountId === accountId) {
        const updatedCashAccount = { ...accountInfo, cash: newCashAmount };
        return updatedCashAccount;
      } else {
        return account;
      }
    });
    saveNewAccount(updatedAccounts);
    res.status(200).send(updatedAccounts);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//update credit by userId and accountId (only positive numbers)
routeAccount.put("/credit/:userId/:accountId", (req, res) => {
  try {
    let accounts = loadAccounts();
    const newCredit = req.body.newCredit;
    const userId = Number(req.params.userId); //req.params.userId typeof is a string
    const accountId = req.params.accountId; //string
    //check match between account and user ids:
    const accountInfo = checkForUserAccountValidation(accounts, userId, accountId);
    if (accountInfo.isActive === false) {
      throw new Error(`Account  ${accountInfo.accountId} is not active!`);
    }
    let updatedAccounts = accounts.map((account) => {
      if (account.accountId === accountId) {
        const updatedCreditAccount = { ...accountInfo, credit: newCredit };
        return updatedCreditAccount;
      } else {
        return account;
      }
    });
    saveNewAccount(updatedAccounts);
    res.status(200).send(updatedAccounts);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//withdraw money from the user (can withdraw money until the cash and credit run out) by user and account ids:
routeAccount.put("/withdraw/:userId/:accountId", (req, res) => {
  try {
    let accounts = loadAccounts();
    const withdraw = req.body.withdraw;
    const userId = Number(req.params.userId); //req.params.userId typeof is a string
    const accountId = req.params.accountId; //string
    //check match between account and user ids:
    const accountInfo = checkForUserAccountValidation(accounts, userId, accountId);
    if (accountInfo.isActive === false) {
      throw new Error(`Account  ${accountInfo.accountId} is not active!`);
    }
    //withdraw conditions:
    const { newCashAmount, newCredit } = withdrawValid(accountInfo, withdraw);
    let updatedAccounts = accounts.map((account) => {
      if (account.accountId === accountId) {
        const updatedCashAccount = { ...accountInfo, cash: newCashAmount, credit: newCredit };
        return updatedCashAccount;
      } else {
        return account;
      }
    });
    saveNewAccount(updatedAccounts);
    res.status(200).send(updatedAccounts);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//transfering money from user1 with account1 to user2 with account2 until cash and credit run out:
routeAccount.put("/transfer/:userId1/:accountId1/:userId2/:accountId2", (req, res) => {
  try {
    let accounts = loadAccounts();
    const transferAmount = req.body.transfer;
    const userId1 = Number(req.params.userId1); //req.params.userId typeof is a string
    const accountId1 = req.params.accountId1; //string
    const userId2 = Number(req.params.userId2); //req.params.userId typeof is a string
    const accountId2 = req.params.accountId2; //string

    //check match between account and user ids:
    const accountInfo1 = checkForUserAccountValidation(accounts, userId1, accountId1);
    const accountInfo2 = checkForUserAccountValidation(accounts, userId2, accountId2);
    if (accountInfo1.isActive === false || accountInfo2.isActive === false) {
      throw new Error(`One of the accounts is not active!`);
    }
    //check if user 1 has enough money to transfer
    const { newCashAmount, newCredit } = withdrawValid(accountInfo1, transferAmount);
    console.log(newCashAmount);
    const newCashAmount2 = transferAmount + accountInfo2.cash;
    let updatedAccounts = accounts.map((account) => {
      if (account.accountId === accountId1) {
        const updatedCashAccount1 = { ...accountInfo1, cash: newCashAmount, credit: newCredit };
        return updatedCashAccount1;
      } else if (account.accountId === accountId2) {
        const updatedCashAccount2 = { ...accountInfo2, cash: newCashAmount2 };
        return updatedCashAccount2;
      } else {
        return account;
      }
    });
    saveNewAccount(updatedAccounts);
    res.status(200).send(updatedAccounts);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

const loadAccounts = () => {
  try {
    const dataBuffer = fs.readFileSync(accountsPath);
    const dataJSON = dataBuffer.toString();
    const data = JSON.parse(dataJSON);
    return data;
  } catch (e) {
    return [];
  }
};

const checkForUserAccountValidation = (accounts, userId, accountId) => {
  const users = loadUsers();
  const userToCheck = users.find((user) => user.userId === userId);
  if (userToCheck === undefined) {
    throw new Error(`User ${userId} not found!`);
  } else {
    const accountToCheck = userToCheck.accounts.find((account) => {
      return account === accountId;
    });
    if (accountToCheck === undefined) throw new Error(`Account  ${accountId} is not belong to that user!`);
  }
  const accountInfo = accounts.find((account) => {
    return account.accountId === accountId;
  });
  //in the case the account belongs to the user but not defined in the array of accounts yet:
  if (accountInfo === undefined) {
    throw new Error(`Account ${accountId} not found!`);
  } else {
    return accountInfo;
  }
};

const withdrawValid = (accountInfo, withdraw) => {
  let newCredit = accountInfo.credit;
  let newCashAmount = accountInfo.cash;
  if (withdraw === accountInfo.cash + accountInfo.credit) {
    newCredit = 0;
    newCashAmount = 0;
  } else if (withdraw > accountInfo.cash + accountInfo.credit) {
    throw new Error("Not enough money in both cash and credit! Try to withdraw less money.");
  } else if (withdraw <= accountInfo.cash) {
    newCashAmount = accountInfo.cash - withdraw;
  } else {
    //if withdraw is bigger the cash and smaller then cash+credit
    newCashAmount = 0;
    newCredit = accountInfo.credit - (withdraw - accountInfo.cash);
  }
  return { newCashAmount, newCredit };
};

const saveNewAccount = (accounts) => {
  try {
    const accountsJson = JSON.stringify(accounts);

    fs.writeFileSync(accountsPath, accountsJson);
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

module.exports = routeAccount;
