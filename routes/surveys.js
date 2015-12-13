var express = require('express'),
    Survey = require('../models/survey'),
    Comment = require('../models/comment'),
    Answer = require('../models/answer'),
    User = require('../models/User');
var router = express.Router();

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
}

router.get('/', needAuth, function(req, res, next) {
  Survey.find({}, function(err, docs) {
    if (err) {
      return next(err);
    }
    res.render('surveys/index', {surveys: docs});
  });
});

router.get('/new', function(req, res, next) {
  res.render('surveys/new');
});

router.post('/', function(req, res, next) {
  var survey = new Survey({
    title: req.body.title,
    email: req.body.email,
    content: req.body.content,
    type: req.body.type,
    category1 : req.body.category1,
    category2 : req.body.category2,
    category3 : req.body.category3,
    category4 : req.body.category4
  });

  router.get('/', needAuth, function(req, res, next) {
    res.render('/surveys');
  });

  module.exports = router;
  survey.save(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/surveys');
  });
});

router.get('/:id', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    Comment.find({survey: survey.id}, function(err, comments) {
      if (err) {
        return next(err);
      }
      res.render('surveys/show', {survey: survey, comments: comments});
    });
  });
});

router.get('/:id', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    Answer.find({survey: survey.id}, function(err, answers) {
      if (err) {
        return next(err);
      }
      res.render('surveys/show', {survey: survey, answers: answers});
    });
  });
});

router.put('/:id', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    if (req.body.password === survey.password) {
      survey.email = req.body.email;
      survey.title = req.body.title;
      survey.content = req.body.content;
      survey.save(function(err) {
        res.redirect('/surveys/' + req.params.id);
      });
    }
    res.redirect('back');
  });
});

router.delete('/:id', function(req, res, next) {
  Survey.findOneAndRemove(req.params.id, function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/surveys/');
  });
});
router.get('/:id/edit', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    res.render('surveys/edit', {survey: survey});
  });
});


router.post('/:id/comments', function(req, res, next) {
  var comment = new Comment({
    survey: req.params.id,
    email: req.body.email,
    content: req.body.content
  });

  comment.save(function(err) {
    if (err) {
      return next(err);
    }
    Survey.findByIdAndUpdate(req.params.id, {$inc: {numComment: 1}}, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/surveys/' + req.params.id);
    });
  });
});

router.post('/:id/answers', function(req, res, next) {
  var answer  = new Answer({
    survey: req.params.id,
    email: req.body.email,
    answer: req.body.answer
  });

  answer.save(function(err) {
    if (err) {
      return next(err);
    }
    Survey.findByIdAndUpdate(req.params.id, {$inc: {numAnswer: 1}}, function(err) {
      if (err) {
        return next(err);
      }

      res.redirect('/surveys/' + req.params.id);
    });
  });
});

module.exports = router;
