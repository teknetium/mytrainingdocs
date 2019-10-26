/*
 |--------------------------------------
 | Dependencies
 |--------------------------------------
 */

const jwt = require("express-jwt");
const jwks = require("jwks-rsa");
const Training = require("./models/Training");
const User = require("./models/User");
const File = require("./models/File");

/*
 |--------------------------------------
 | Authentication Middleware
 |--------------------------------------
 */

module.exports = function(app, config) {
  // Authentication middleware
  const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),
    audience: config.AUTH0_API_AUDIENCE,
    issuer: `https://${config.AUTH0_DOMAIN}/`,
    algorithm: "RS256",
  });

  // Check for an authenticated admin user
  const adminCheck = (req, res, next) => {
    const roles = req.user[config.NAMESPACE] || [];
    /*
    if (roles.indexOf('admin') > -1) {
      next();
    } else {
      res.status(401).send({message: 'Not authorized for admin access'});
    }
    */
    next();
  };

/*
 |--------------------------------------
 | API Routes
 |--------------------------------------
 */

  const trainingListProjection = "_id title type owner description teamId iconType iconClass iconColor iconSource dateCreated sections tags estimatedTimeToComplete";
  const userListProjection = "_id uid userType userStatus myTrainings trainingStatus firstName lastName email org directReports tags supervisor profilePicUrl";
  const fileListProjection = "_id name size teamId iconColor iconSource iconType iconClass description tags versions";

  // GET API root
  app.get("/api/", (req, res) => {
    res.send("API works");
  });

  app.get("/api/trainings/:teamId", (req, res) => {
    Training.find({teamId: req.params.teamId},
      trainingListProjection, (err, trainings) => {
        let trainingsArr = [];
        if (err) {
          return res.status(500).send({message: err.message});
        }
        if (trainings) {
          trainings.forEach(training => {
            trainingsArr.push(training);
          });
        }
        res.send(trainingsArr);
      },
    );
  });

  app.get("/api/team/:uid", (req, res) => {
    User.find({supervisor: req.params.uid},
      userListProjection, (err, users) => {
        let usersArr = [];
        if (err) {
          return res.status(500).send({message: err.message});
        }
        if (users) {
          users.forEach(user => {
            usersArr.push(user);
          });
        }
        res.send(usersArr);
      });
  });

  // GET training by training ID
  app.get("/api/training/:id", jwtCheck, (req, res) => {
    Training.findById(req.params.id, (err, training) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!training) {
        return res.status(400).send({message: "Training not found."});
      }
      res.send(training);
    });
  });

  // POST a new event
  app.post("/api/training/new", jwtCheck, (req, res) => {
    const training = new Training({
      _id: req.body._id,
      title: req.body.title,
      type: req.body.type,
      teamId: req.body.teamId,
      owner: req.body.owner,
      dateCreated: req.body.dateCreated,
      estimatedTimeToComplete: req.body.estimatedTimeToComplete,
      description: req.body.description,
      image: req.body.image,
      iconClass: req.body.iconClass,
      iconColor: req.body.iconColor,
      iconSource: req.body.iconSource,
      sections: req.body.sections,
      tags: req.body.tags,
      assessment: req.body.assessment,
    });
    Training.create(training, function(err, trainingObj) {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      res.send(trainingObj);
    });
  });

  // PUT (edit) an existing training
  app.put("/api/trainings/:id", jwtCheck, (req, res) => {
    Training.findById(req.params.id, (err, training) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!training) {
        return res.status(400).send({message: "Training not found."});
      }
      training._id = req.body._id;
      training.type = req.body.type;
      training.title = req.body.title;
      training.teamId = req.body.teamId;
      training.owner = req.body.owner;
      training.dateCreated = req.body.dateCreated;
      training.estimatedTimeToComplete = req.body.estimatedTimeToComplete;
      training.description = req.body.description;
      training.image = req.body.image;
      training.iconClass = req.body.iconClass;
      training.iconColor = req.body.iconColor;
      training.iconSource = req.body.iconSource;
      training.sections = req.body.sections;
      training.tags = req.body.tags;
      training.assessment = req.body.assessment;

      training.save(err2 => {
        if (err) {
          return res.status(500).send({message: err2.message});
        }
        res.send(training);
      });
    });
  });

  app.delete("/api/trainings/:id", jwtCheck, (req, res) => {
    Training.findById(req.params.id, (err, foo) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!foo) {
        return res.status(400).send({message: "Training not found."});
      }
      foo.remove(err2 => {
        if (err2) {
          return res.status(500).send({message: err2.message});
        }
        res.status(200).send({message: "training successfully deleted."});
      });
    });
  });

  app.get("/api/user/:id", jwtCheck, (req, res) => {
    User.findById(req.params.id, userListProjection, (err, user) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!user) {
        return res.status(400).send({message: "User not found."});
      }
      res.send(user);
    });
  });
  app.post("/api/user/new", jwtCheck, (req, res) => {
    User.findById(req.body._id, (err, existingUser) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (existingUser) {
        return res.send(existingUser);
      }

      const user = new User({
        _id: req.body._id,
        uid: req.body.uid,
        userType: req.body.userType,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        org: req.body.org,
        userStatus: req.body.userStatus,
        trainingStatus: req.body.trainingStatus,
        directReports: req.body.directReports,
        myTrainings: req.body.myTrainings,
        profilePicUrl: req.body.profilePicUrl,
        supervisor: req.body.supervisor,
        tags: req.body.tags,
      });
//      user.save((err2) => {
      User.create(user, function(err2, userObj) {
        if (err2) {
          return res.status(500).send({message: err2.message});
        }
        res.send(userObj);
      });
    });
  });
  app.put("/api/users/:id", jwtCheck, (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!user) {
        return res.status(400).send({message: "User not found."});
      }
      user.uid = req.body.uid;
      user.userType = req.body.userType;
      user.org = req.body.org;
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;
      user.userStatus = req.body.userStatus;
      user.trainingStatus = req.body.trainingStatus;
      user.directReports = req.body.directReports;
      user.myTrainings = req.body.myTrainings;
      user.profilePicUrl = req.body.profilePicUrl;
      user.supervisor = req.body.supervisor;
      user.tags = req.body.tags;
      user._id = req.body._id;

      user.save(err2 => {
        if (err2) {
          return res.status(500).send({message: err2.message});
        }
        res.send(user);
      });
    });
  });
  app.delete("/api/users/:id", jwtCheck, (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!user) {
        return res.status(400).send({message: "User not found."});
      }
      user.remove(err2 => {
        if (err2) {
          return res.status(500).send({message: err2.message});
        }
        res.status(200).send({message: "File successfully deleted."});
      });
    });
  });

  //
  // FILE methods
  //
  app.get("/api/files/:uid", (req, res) => {
    File.find({teamId: req.params.uid}, fileListProjection, (err, files) => {
      let filesArr = [];
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (files) {
        files.forEach(file => {
          filesArr.push(file);
        });
      }
      res.send(files);
    });
  });
  app.post("/api/files/new", jwtCheck, (req, res) => {
    const file = new File({
      versions: req.body.versions,
      teamId: req.body.teamId,
      name: req.body.name,
      size: req.body.size,
      mimeType: req.body.mimeType,
      iconClass: req.body.iconClass,
      iconType: req.body.iconType,
      iconColor: req.body.iconColor,
      iconSource: req.body.iconSource,
      description: req.body.description,
      tags: req.body.tags,
      _id: req.body._id,
    });
    File.create(file, function(err2, fileObj) {
      if (err2) {
        return res.status(500).send({message: err2.message});
      }
      res.send(fileObj);
    });
  });
  app.put("/api/files/:id", jwtCheck, (req, res) => {
    File.findById(req.params.id, (err, file) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!file) {
        return res.status(400).send({message: "File not found."});
      }
      file.teamId = req.body.teamId;
      file.name = req.body.name;
      file.size = req.body.size,
      file.mimeType = req.body.mimeType,
      file.iconClass = req.body.iconClass;
      file.iconType = req.body.iconType;
      file.iconColor = req.body.iconColor;
      file.iconSource = req.body.iconSource;
      file.description = req.body.description;
      file.tags = req.body.tags;
      file.versions = req.body.versions;
      file._id = req.body._id;

      file.save(err2 => {
        if (err2) {
          return res.status(500).send({message: err2.message});
        }
        res.send(file);
      });
    });
  });
  app.delete("/api/files/:id", jwtCheck, (req, res) => {
    File.findById(req.params.id, (err, file) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!file) {
        return res.status(400).send({message: "File not found."});
      }
      file.remove(err2 => {
        if (err2) {
          return res.status(500).send({message: err2.message});
        }
        res.status(200).send({message: "File successfully deleted."});
      });
    });
  });
};
