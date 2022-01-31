module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.lastPage = req.originalUrl;
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};
