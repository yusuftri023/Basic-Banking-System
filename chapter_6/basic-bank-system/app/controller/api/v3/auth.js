const model = require("./../../../model/v3/accounts");
const auth = require("./../../../../utils/auth");
const { PrismaClient } = require("@prisma/client");
const { JWTsign } = require("../../../../utils/jwt");
const prisma = new PrismaClient();

module.exports = {
  async registerNewAccount(req, res, next) {
    try {
      const { email, password, user_id } = req.body;
      if (!email || !password || !+user_id) {
        return res.status(400).json({
          status: "fail",
          code: 400,
          message: "Bad request : request is not complete ",
        });
      }
      const search_id = await model.searchUserId(+user_id);
      if (!search_id) {
        return res.status(404).json({
          status: "fail",
          code: 404,
          message: "User does not exist",
        });
      }
      let hashed_password = await auth.hashPassword(password);
      const result = await model.createNewAccount(
        email,
        user_id,
        hashed_password
      );
      if (result) {
        return res.status(201).json({
          status: "success",
          code: 201,
          message: "Account has been created",
          data: result,
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: error,
      });
    }
  },
  async loginAccount(req, res) {
    const accountData = await prisma.accounts.findFirst({
      where: {
        email: req.body.email,
      },
    });
    const isCorrect = await auth.checkPassword(
      req.body.password,
      accountData.password
    );

    if (!isCorrect) {
      res.status(400).json({
        status: "fail",
        code: 400,
        message: "Login gagal",
      });
    }
    if (isCorrect) {
      delete accountData.password;
      const token = await JWTsign(accountData);
      res.status(201).json({
        status: "success",
        code: 201,
        message: "Login success",
        data: { accountData, token },
      });
    }
  },
  async whoami(req, res) {
    return res.status(200).json({
      status: "success",
      message: "OK",
      data: {
        user: req.user,
      },
    });
  },
  async registerForm(req, res, next) {
    try {
      const { email, password, user_id } = req.body;
      const user = await prisma.accounts.findFirst({
        where: {
          email,
        },
      });
      if (user) {
        req.flash("error", "Email sudah terdaftar!");
        return res.redirect("/api/v3/auth/register");
      }
      const createUser = await prisma.accounts.create({
        data: {
          email,
          user_id: +user_id,
          password: await auth.hashPassword(password),
        },
      });
      req.flash("success", "Email berhasil didaftar!");
      return res.redirect("/api/v3/auth/login");
    } catch (error) {
      next(error);
    }
  },
  authUser: async (email, password, done) => {
    try {
      const user = await prisma.accounts.findUnique({
        where: { email },
      });
      if (!user || !(await auth.checkPassword(password, user.password))) {
        return done(null, false, { message: "Invalid email or password" });
      }
      return done(null, user);
    } catch (error) {
      return done(null, false, { message: error.message });
    }
  },
  dashboard: async (req, res, next) => {
    res.render("dashboard", { user: req.user });
  },
  oauth: async (req, res) => {
    delete req.user.password;
    const user = req.user;
    const token = await JWTsign(user);
    return res.json({
      status: "success",
      message: "Berhasil login",
      data: { token },
    });
  },
};
