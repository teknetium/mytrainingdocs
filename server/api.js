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
const Event = require("./models/Event");

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

  const trainingListProjection = "_id title type owner description introduction introductionLabel goals goalsLabel execSummary execSummaryLabel teamId iconType iconClass iconColor iconSource dateCreated pages estimatedTimeToComplete jobTitle assessment useAssessment";
  const userListProjection = "_id uid userType userStatus jobTitle trainingStatus firstName lastName email adminUp teamId supervisor profilePicUrl";
  const fileListProjection = "_id name size teamId mimeType iconColor iconSource iconType iconClass description versions";
  const eventListProjection = "_id name type creationDate actionDate teamId description";

  // GET API root
  app.get("/api/", (req, res) => {
    res.send("API works");
  });

  //
  // Training API
  //
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
  app.post("/api/training/new", jwtCheck, (req, res) => {
    const training = new Training({
      _id: req.body._id,
      title: req.body.title,
      type: req.body.type,
      teamId: req.body.teamId,
      owner: req.body.owner,
      dateCreated: req.body.dateCreated,
      estimatedTimeToComplete: req.body.estimatedTimeToComplete,
      jobTitle: req.body.jobTitle,
      description: req.body.description,
      execSummary: req.body.execSummary,
      execSummaryLabel: req.body.execSummaryLabel,
      introduction: req.body.introduction,
      introductionLabel: req.body.introductionLabel,
      goals: req.body.goals,
      goalsLabel: req.body.goalsLabel,
      image: req.body.image,
      iconClass: req.body.iconClass,
      iconColor: req.body.iconColor,
      iconSource: req.body.iconSource,
      pages: req.body.pages,
      assessment: req.body.assessment,
      useAssessment: req.body.useAssessment
    });
    Training.create(training, function (err, trainingObj) {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.send(trainingObj);
    });
  });
  app.put("/api/trainings/:id", jwtCheck, (req, res) => {
    Training.findById(req.params.id, (err, training) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!training) {
        return res.status(400).send({ message: "Training not found." });
      }
      training._id = req.body._id;
      training.type = req.body.type;
      training.title = req.body.title;
      training.teamId = req.body.teamId;
      training.owner = req.body.owner;
      training.dateCreated = req.body.dateCreated;
      training.estimatedTimeToComplete = req.body.estimatedTimeToComplete;
      training.jobTitle = req.body.jobTitle;
      training.description = req.body.description;
      training.introduction = req.body.introduction;
      training.introductionLabel = req.body.introductionLabel;
      training.goals = req.body.goals;
      training.goalsLabel = req.body.goalsLabel;
      training.execSummary = req.body.execSummary;
      training.execSummaryLabel = req.body.execSummaryLabel;
      training.image = req.body.image;
      training.iconClass = req.body.iconClass;
      training.iconColor = req.body.iconColor;
      training.iconSource = req.body.iconSource;
      training.pages = req.body.pages;
      training.assessment = req.body.assessment;
      training.useAssessment = req.body.useAssessment;

      training.save(err2 => {
        if (err) {
          return res.status(500).send({ message: err2.message });
        }
        res.send(training);
      });
    });
  });

  app.delete("/api/trainings/:id", jwtCheck, (req, res) => {
    Training.findById(req.params.id, (err, foo) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!foo) {
        return res.status(400).send({ message: "Training not found." });
      }
      foo.remove(err2 => {
        if (err2) {
          return res.status(500).send({ message: err2.message });
        }
        res.status(200).send({ message: "training successfully deleted." });
      });
    });
  });

  //
  // User API
  //
  app.get("/api/users/:teamId", (req, res) => {
    User.find({teamId: req.params.teamId},
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

  app.get("/api/user/:email", jwtCheck, (req, res) => {
    User.findOne({ email: req.params.email }, userListProjection, (err, user) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!user) {
        return res.status(400).send({ message: "User not found." });
      }
      res.send(user);
    });
  });

  app.get("/api/user/:uid", jwtCheck, (req, res) => {
    User.findOne({ uid: req.params.uid }, userListProjection, (err, user) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!user) {
        return res.status(400).send({ message: "User not found." }); 
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
        adminUp: req.body.adminUp,
        teamId: req.body.teamId,
        userStatus: req.body.userStatus,
        trainingStatus: req.body.trainingStatus,
        jobTitle: req.body.jobTitle,
        profilePicUrl: req.body.profilePicUrl,
        supervisorId: req.body.supervisorId,
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
      user.teamId = req.body.teamId;
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;
      adminUp = req.body.adminUp,
      user.userStatus = req.body.userStatus;
      user.trainingStatus = req.body.trainingStatus;
      user.jobTitle = req.body.jobTitle;
      user.profilePicUrl = req.body.profilePicUrl;
      user.supervisorId = req.body.supervisorId;
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
  app.get("/api/files/:teamId", (req, res) => {
//    File.find({ teamId: req.params.teamId }, fileListProjection, (err, files) => {
      File.find({}, fileListProjection, (err, files) => {
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

  //
  // EVENT methods
  //
  app.get("/api/events/:teamId", (req, res) => {
    Event.find({}, eventListProjection, (err, events) => {
      let eventsArr = [];
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (events) {
        events.forEach(event => {
          eventsArr.push(event);
        });
      }
      res.send(eventsArr);
    });
  });
  app.post("/api/events/new", jwtCheck, (req, res) => {
    const event = new Event({
      type: req.body.type,
      creationDate: req.body.creationDate,
      actionDate: req.body.actionDate,
      teamId: req.body.teamId,
      name: req.body.name,
      description: req.body.description,
      _id: req.body._id,
    });
    Event.create(event, function (err2, eventObj) {
      if (err2) {
        return res.status(500).send({ message: err2.message });
      }
      res.send(eventObj);
    });
  });
  app.put("/api/events/:id", jwtCheck, (req, res) => {
    Event.findById(req.params.id, (err, event) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!event) {
        return res.status(400).send({ message: "Event not found." });
      }
      event.teamId = req.body.teamId;
      event.name = req.body.name;
      event.actionDate = req.body.actionDate;
      event.creationDate = req.body.creationDate;
      event.type = req.body.type;
      event.description = req.body.description;
      event._id = req.body._id;

      event.save(err2 => {
        if (err2) {
          return res.status(500).send({ message: err2.message });
        }
        res.send(event);
      });
    });
  });
  app.delete("/api/events/:id", jwtCheck, (req, res) => {
    Event.findById(req.params.id, (err, event) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!event) {
        return res.status(400).send({ message: "Event not found." });
      }
      event.remove(err2 => {
        if (err2) {
          return res.status(500).send({ message: err2.message });
        }
        res.status(200).send({ message: "Event successfully deleted." });
      });
    });
  });
};
