/*
 |--------------------------------------
 | Dependencies
 |--------------------------------------
 */

const jwt = require("express-jwt");
const jwks = require("jwks-rsa");
const Training = require("./models/Training");
const TrainingArchive = require("./models/TrainingArchive");
const UserTraining = require("./models/UserTraining");
const User = require("./models/User");
const File = require("./models/File");
const Event = require("./models/Event");
const Comment = require("./models/Comment");
const UTSession = require("./models/UTSession");
const sgMail = require('@sendgrid/mail');

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

  sgMail.setApiKey(config.SENDGRID_API_KEY);
/*
 |--------------------------------------
 | API Routes
 |--------------------------------------
 */

  const trainingArchiveProjection = "_id trainings";
  const trainingListProjection = "_id title versions type owner description introduction introductionLabel goals goalsLabel execSummary execSummaryLabel teamId iconType iconClass iconColor iconSource dateCreated pages estimatedTimeToComplete jobTitle assessment useAssessment status interestList shared isValid isDirty";
  const userTrainingListProjection = "_id tid uid status dueDate timeToDate dateCompleted assessmentResponse passedAssessment score trainingVersion";
  const userListProjection = "_id uid userType userStatus jobTitle trainingStatus firstName lastName email teamAdmin orgAdmin appAdmin teamId org supervisorId profilePicUrl settings";
  const fileListProjection = "_id name size teamId mimeType iconColor iconSource iconType iconClass description versions";
  const eventListProjection = "_id title type userId teamId desc mark creationDate actionDate  ";
  const commentListProjection = "_id tid version author text rating date";
  const utSessionProjection = "_id utId uid tid startTime stopTime";

  // GET API root
  app.get("/api/", (req, res) => {
    res.send("API works");
  });

  
  app.post("/api/sendmail", (req, res) => {
    const msg = {
      to: req.body.to,
      from: req.body.from,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
    };
    sgMail.send(msg);
  });

  app.get("/api/daily/usertrainingstatuscheck", (req, res) => {
    UserTraining.find({}, userTrainingListProjection, (err, userTrainings) => {
      let now = new Date().getTime();
      let response = {
        now: now,
        noChange: [],
        pastDue: [],
        errors: []
      }
      let pastDue = [];
      let errors = [];
      if (userTrainings) {
        userTrainings.forEach(userTraining => {
          if (userTraining.dueDate < now) {
            response.pastDue.push(userTraining._id);
            userTraining.status = 'pastDue';
            userTraining.save(err2 => {
              if (err2) {
                response.errors.push(userTraining._id);
              }
            });
            User.findById(userTraining._id, userListProjection, (err, user) => {
              if (err) {
                response.errors.push(userTraining._id);
              }
              if (!user) {
                response.errors.push(userTraining._id);
              }
              user.trainingStatus = 'pastdue';
              user.save(err3 => {
                
              });
            });

          } else {
            response.noChange.push(userTraining._id);
          }
        });
        return res.send(response);
      }
      return res.status(500).send({ message: "no userTraining records found" });
    });
  });
  app.get("/api/daily/notifications", (req, res) => {
    UserTraining.find({}, userTrainingListProjection, (err, userTrainings) => {
      let now = new Date().getTime();
      let response = {
        now: now,
        noChange: [],
        pastDue: [],
        errors: []
      }
      let pastDue = [];
      let errors = [];
      if (userTrainings) {
        userTrainings.forEach(userTraining => {
          if (userTraining.dueDate < now) {
            response.pastDue.push(userTraining._id);
            userTraining.status = 'pastDue';
            userTraining.save(err2 => {
              if (err2) {
                response.errors.push(userTraining._id);
              }
            });
          } else {
            response.noChange.push(userTraining._id);
          }
        });
        return res.send(response);
      }
      return res.status(500).send({ message: "no userTraining records found" });
    });
  });

  //
  // Training API
  //
  app.get("/api/training/:id", (req, res) => {
    Training.findOne({ _id: req.params.id },
      trainingListProjection, (err, training) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        res.send(training);
      },
    );
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
  app.post("/api/training/new", jwtCheck, (req, res) => {
    const training = new Training({
      _id: req.body._id,
      title: req.body.title,
      type: req.body.type,
      versions: req.body.versions,
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
      useAssessment: req.body.useAssessment,
      status: req.body.status,
      interestList: req.body.interestList,
      shared: req.body.shared,
      isValid: req.body.isValid,
      isDirty: req.body.isDirty,
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
      training.versions = req.body.versions;
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
      training.files = req.body.files;
      training.pages = req.body.pages;
      training.status = req.body.status;
      training.assessment = req.body.assessment;
      training.useAssessment = req.body.useAssessment;
      training.interestList = req.body.interestList;
      training.shared = req.body.shared;
      training.isValid = req.body.isValid;
      training.isDirty = req.body.isDirty;

      training.save(err2 => {
        if (err2) {
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
  // Training Working Copy API
  //
  /*
  app.get("/api/trainingsworkingcopy/:id", (req, res) => {
    TrainingWC.findOne({ _id: req.params.id },
      trainingListProjection, (err, training) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        res.send(training);
      },
    );
  });
  app.post("/api/trainingworkingcopy/new", jwtCheck, (req, res) => {
    const training = new TrainingWC({
      _id: req.body._id,
      title: req.body.title,
      type: req.body.type,
      versions: req.body.versions,
      versionPending: req.body.versionPending,
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
      files: req.body.files,
      pages: req.body.pages,
      assessment: req.body.assessment,
      useAssessment: req.body.useAssessment,
      rating: req.body.rating,
      status: req.body.status,
      interestList: req.body.interestList,
      shared: req.body.shared,
      isValid: req.body.isValid,
      isDirty: req.body.isDirty,
    });
    TrainingWC.create(training, function (err, trainingObj) {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.send(trainingObj);
    });
  });
app.put("/api/trainingsworkingcopy/:id", jwtCheck, (req, res) => {
    TrainingWC.findById(req.params.id, (err, training) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!training) {
        return res.status(400).send({ message: "Training not found." });
      }
      training._id = req.body._id;
      training.type = req.body.type;
      training.versions = req.body.versions;
      training.versionPending = req.body.versionPending;
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
      training.files = req.body.files;
      training.pages = req.body.pages;
      training.rating = req.body.rating;
      training.status = req.body.status;
      training.assessment = req.body.assessment;
      training.useAssessment = req.body.useAssessment;
      training.interestList = req.body.interestList;
      training.shared = req.body.shared;
      training.isValid = req.body.isValid;
      training.isDirty = req.body.isDirty;

      training.save(err2 => {
        if (err2) {
          return res.status(500).send({ message: err2.message });
        }
        res.send(training);
      });
    });
  });
  app.delete("/api/trainingsworkingcopy/:id", jwtCheck, (req, res) => {
    TrainingWC.findById(req.params.id, (err, foo) => {
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
*/
  //
  // Training Archive API
  //
  app.get("/api/trainingarchive/:id", (req, res) => {
    TrainingArchive.findOne({ _id: req.params.id },
      trainingArchiveProjection, (err, training) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        res.send(training);
      },
    );
  });
  app.post("/api/trainingarchive/new", jwtCheck, (req, res) => {
    const trainingArchive = new TrainingArchive({
      _id: req.body._id,
      trainings: req.body.trainings
    });
    TrainingArchive.create(trainingArchive, function (err, trainingArchiveObj) {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.send(trainingArchiveObj);
    });
  });
  app.put("/api/trainingarchive/:id", jwtCheck, (req, res) => {
    TrainingArchive.findById(req.params.id, (err, trainingArchive) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!trainingArchive) {
        return res.status(400).send({ message: "Training archive not found." });
      }
      trainingArchive._id = req.body._id;
      trainingArchive.trainings = req.body.trainings;

      trainingArchive.save(err2 => {
        if (err2) {
          return res.status(500).send({ message: err2.message });
        }
        res.send(trainingArchive);
      });
    });
  });
  app.delete("/api/trainingarchive/:id", jwtCheck, (req, res) => {
    TrainingArchive.findById(req.params.id, (err, foo) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!foo) {
        return res.status(400).send({ message: "Training archive not found." });
      }
      foo.remove(err2 => {
        if (err2) {
          return res.status(500).send({ message: err2.message });
        }
        res.status(200).send({ message: "Training archive successfully deleted." });
      });
    });
  });

  //
  // UserTraining API
  //
  app.get("/api/usertraining/uid/:userId", (req, res) => {
    UserTraining.find({ uid: req.params.userId },
      userTrainingListProjection, (err, userTrainings) => {
        let userTrainingsArr = [];
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        if (userTrainings) {
          userTrainings.forEach(userTraining => {
            userTrainingsArr.push(userTraining);
          });
        }
        res.send(userTrainingsArr);
      },
    );
  });
  app.get("/api/usertraining/tid/:trainingId", (req, res) => {
    UserTraining.find({ tid: req.params.trainingId },
      userTrainingListProjection, (err, userTrainings) => {
        let userTrainingsArr = [];
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        if (userTrainings) {
          userTrainings.forEach(userTraining => {
            userTrainingsArr.push(userTraining);
          });
        }
        res.send(userTrainingsArr);
      },
    );
  });
  app.post("/api/usertraining/new", jwtCheck, (req, res) => {
    const userTraining = new UserTraining({
      _id: req.body._id,
      tid: req.body.tid,
      uid: req.body.uid,
      status: req.body.status,
      dueDate: req.body.dueDate,
      dateCompleted: req.body.dateCompleted,
      timeToDate: req.body.timeToDate,
      passedAssessment: req.body.passedAssessment,
      score: req.body.score,
      assessmentResponse: req.body.assessmentResponse,
      trainingVersion: req.body.trainingVersion
    });
    UserTraining.create(userTraining, function (err, userTrainingObj) {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.send(userTrainingObj);
    });
  });
  app.put("/api/usertraining/:id", jwtCheck, (req, res) => {
    UserTraining.findById(req.params.id, (err, userTraining) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!userTraining) {
        return res.status(400).send({ message: "UserTraining not found." });
      }
      userTraining._id = req.body._id;
      userTraining.tid = req.body.tid;
      userTraining.uid = req.body.uid;
      userTraining.status = req.body.status;
      userTraining.dueDate = req.body.dueDate;
      userTraining.dateCompleted = req.body.dateCompleted;
      userTraining.assessmentResponse = req.body.assessmentResponse;
      userTraining.score = req.body.score;
      userTraining.passedAssessment = req.body.passedAssessment;
      userTraining.trainingVersion = req.body.trainingVersion;
      userTraining.timeToDate = req.body.timeToDate;

      userTraining.save(err2 => {
        if (err) {
          return res.status(500).send({ message: err2.message });
        }
        res.send(userTraining);
      });
    });
  });
  app.delete("/api/usertraining/:id", jwtCheck, (req, res) => {
    UserTraining.findById(req.params.id, (err, userTraining) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!userTraining) {
        return res.status(400).send({ message: "UserTraining not found." });
      }
      userTraining.remove(err2 => {
        if (err2) {
          return res.status(500).send({ message: err2.message });
        }
        res.status(200).send({ message: "userTraining successfully deleted." });
      });
    });
  });

  //
  // UTSession API
  //
  app.post("/api/utsession/new", jwtCheck, (req, res) => {
    const utSession = new UTSession({
      _id: req.body._id,
      utId: req.body.utId,
      uid: req.body.uid,
      tid: req.body.tid,
      startTime: req.body.startTime,
      stopTime: req.body.stopTime,
    });
    UTSession.create(utSession, function (err, utSessionObj) {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.send(utSessionObj);
    });
  });
  app.get("/api/utsession/tid/:tid", (req, res) => {
    UTSession.find({ tid: req.params.tid },
      utSessionProjection, (err, utSessions) => {
        let utSessionArr = [];
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        if (utSessions) {
          utSessions.forEach(utSession => {
            utSessionArr.push(utSession);
          });
        }
        res.send(utSessionArr);
      },
    );
  });
  app.get("/api/utsession/uid/:uid", (req, res) => {
    UTSession.find({ uid: req.params.uid },
      utSessionProjection, (err, utSessions) => {
        let utSessionArr = [];
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        if (utSessions) {
          utSessions.forEach(utSession => {
            utSessionArr.push(utSession);
          });
        }
        res.send(utSessionArr);
      },
    );
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
  app.get("/api/users/org/:org", (req, res) => {
    User.find({ org: req.params.org },
      userListProjection, (err, users) => {
        let usersArr = [];
        if (err) {
          return res.status(500).send({ message: err.message });
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

  app.get("/api/user/email/:email", jwtCheck, (req, res) => {
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

  app.get("/api/user/uid/:uid", jwtCheck, (req, res) => {
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
        teamAdmin: req.body.teamAdmin,
        orgAdmin: req.body.orgAdmin,
        appAdmin: req.body.appAdmin,
        teamId: req.body.teamId,
        org: req.body.org,
        userStatus: req.body.userStatus,
        trainingStatus: req.body.trainingStatus,
        jobTitle: req.body.jobTitle,
        profilePicUrl: req.body.profilePicUrl,
        supervisorId: req.body.supervisorId,
        settings: req.body.settings,
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
      user.org = req.body.org;
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;
      user.teamAdmin = req.body.teamAdmin,
      user.orgAdmin = req.body.orgAdmin,
      user.appAdmin = req.body.appAdmin,
      user.userStatus = req.body.userStatus;
      user.trainingStatus = req.body.trainingStatus;
      user.jobTitle = req.body.jobTitle;
      user.profilePicUrl = req.body.profilePicUrl;
      user.supervisorId = req.body.supervisorId;
      user.settings = req.body.settings;
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
    Event.find({teamId: req.params.teamId}, eventListProjection, (err, events) => {
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
      _id: req.body._id,
      title: req.body.title,
      type: req.body.type,
      userId: req.body.userId,
      teamId: req.body.teamId,
      desc: req.body.desc,
      mark: req.body.mark,
      creationDate: req.body.creationDate,
      actionDate: req.body.actionDate,
    });
    Event.create(event, function (err2, eventObj) {
      if (err2) {
        return res.status(500).send({ message: err2.message });
      }
      res.send(eventObj);
    });
  });
  /*
  app.put("/api/events/:id", jwtCheck, (req, res) => {
    Event.findById(req.params.id, (err, event) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!event) {
        return res.status(400).send({ message: "Event not found." });
      }
      event._id = req.body._id;
      event.title = req.body.title;
      event.type = req.body.type;
      event.userId = req.body.userId;
      event.teamId = req.body.teamId;
      event.desc = req.body.desc;
      event.mark = req.body.mark;
      event.creationDate = req.body.creationDate;
      event.actionDate = req.body.actionDate;

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
*/
  //
  // Comment methods
  //
  app.get("/api/comments/:trainingId", (req, res) => {
    Comment.find({ tid: req.params.trainingId}, commentListProjection, (err, comments) => {
      let commentsArr = [];
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (comments) {
        comments.forEach(comment => {
          commentsArr.push(comment);
        });
      }
      res.send(commentsArr);
    });
  });
  app.post("/api/comments/new", jwtCheck, (req, res) => {
    const comment = new Comment({
      tid: req.body.tid,
      date: req.body.date,
      text: req.body.text,
      rating: req.body.rating,
      rating: req.body.rating,
      author: req.body.author,
      version: req.body.version,
      _id: req.body._id,
    });
    Comment.create(comment, function (err2, commentObj) {
      if (err2) {
        return res.status(500).send({ message: err2.message });
      }
      res.send(commentObj);
    });
  });
  app.delete("/api/comments/:id", jwtCheck, (req, res) => {
    Comment.findById(req.params.id, (err, comment) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!event) {
        return res.status(400).send({ message: "Event not found." });
      }
      comment.remove(err2 => {
        if (err2) {
          return res.status(500).send({ message: err2.message });
        }
        res.status(200).send({ message: "Comment successfully deleted." });
      });
    });
  });

};
