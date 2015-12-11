var express = require('express'),
    Survey = require('../models/survey'),
    Comment = require('../models/comment');
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
    content: req.body.content
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

module.exports = router;
